#!/bin/bash -e
set -a
LOG=${LOG:-/home/vagrant/bastion/vagrant/tmp/log/boot.log}
set +a

NODE_VER=${NODE_VER:-10.x}

PGVERSION=${PGVERSION:-10}
PGDATABASE=${PGDATABASE:-yakchatauthdb}
PGPORT=${PGPORT:-5433}
PGUSER=${PGUSER:-postgres}
PGPASSWORD=${PGPASSWORD:-devved}

DB_DIR=${DB_DIR:-/home/vagrant/yakchat-auth-server/migrations/}

echo "starting provisioning..."
echo "NODE_VER: ${NODE_VER}"
echo "PGVERSION: ${PGVERSION}"
echo "PGDATABASE: ${PGDATABASE}"
echo "PGPORT: ${PGPORT}"
echo "PGUSER: ${PGUSER}"
echo "PGPASSWORD: ${PGPASSWORD}"

ETH0IP=$(ifconfig -a eth0 | grep "inet addr:")

mkdir -p /vagrant/tmp/log

print_db_usage () {
  echo "Your Postgres environment has been setup"
  echo "Networking: [ $ETH0IP ]"
  echo ""
  echo "  Port: $PGPORT"
  echo "  Database: $PGDATABASE"
  echo "  Username: $PGUSER"
  echo "  Password: $PGPASSWORD"
  echo ""
  echo "psql access to app database user via VM:"
  echo "  vagrant ssh"
  echo "  sudo su - postgres"
  echo "  PGUSER=$PGUSER PGPASSWORD=$PGPASSWORD psql -h localhost $PGDATABASE"
  echo ""
  echo "Env variable for application development:"
  echo "  DATABASE_URL=postgresql://$PGUSER:$PGPASSWORD@*:$PGPORT/$PGDATABASE"
  echo ""
  echo "Local command to access the database via psql:"
  echo "  PGUSER=$PGUSER PGPASSWORD=$PGPASSWORD psql -h localhost -p $PGPORT $PGDATABASE"
  echo ""
  echo "  Getting into the box (terminal):"
  echo "  vagrant ssh"
  echo "  sudo su - postgres"
  echo ""
}

export DEBIAN_FRONTEND=noninteractive


display() {
	echo -e "\n-----> "$0": "$*
}


PROVISIONED_ON=/etc/vm_provision_on_timestamp
if [ -f "$PROVISIONED_ON" ]
then
  echo "VM was already provisioned at: $(cat $PROVISIONED_ON)"
  echo "To run system updates manually login via 'vagrant ssh' and run 'apt-get update && apt-get upgrade'"
  echo ""
  print_db_usage
  exit
fi

display add postgresql apt sources

# Add PostgreSQL Apt repository to get latest stable
PG_REPO_APT_SOURCE=/etc/apt/sources.list.d/pgdg.list
if [ ! -f "$PG_REPO_APT_SOURCE" ]
then
	echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > "$PG_REPO_APT_SOURCE"
  #echo "deb http://security.ubuntu.com/ubuntu xenial-security main" > "$PG_REPO_APT_SOURCE"
	wget --quiet -O - http://apt.postgresql.org/pub/repos/apt/ACCC4CF8.asc | sudo apt-key add -
fi


display update apt packages
apt-get update


#display install postgresql dependency with version 10.3
#sudo apt-get install libicu55


display install node
#apt-get -y install curl
apt-get -y install build-essential
curl -sL "https://deb.nodesource.com/setup_$NODE_VER" | sudo -E bash -


display "install node version ${NODE_VER}"
sudo apt-get install -y nodejs


display Install jq
apt-get -y install jq


display install openssl dependency
apt-get -y install libssl-dev


# Install PostgreSQL
echo "install postgresql version ${PGVERSION}"
# -qq implies -y --force-yes
#sudo apt-get install -qq "postgresql-$PGVERSION" "postgresql-contrib-$PGVERSION"
# Install dev version of postgresql to support debugging
apt-get -qq install "postgresql-server-dev-$PGVERSION" "postgresql-contrib-$PGVERSION" "postgresql-plpython-$PGVERSION" "postgresql-plperl-$PGVERSION"


# Configure PostgreSQL
# Listen for localhost connections
PG_CONF="/etc/postgresql/$PGVERSION/main/postgresql.conf"
PG_HBA="/etc/postgresql/$PGVERSION/main/pg_hba.conf"


# update postgres user password
cat << EOF | su - postgres -c psql
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION PASSWORD '$PGPASSWORD';
EOF


# add bastion user
cat << EOF | su - postgres -c psql
CREATE ROLE yakchat_admin WITH PASSWORD '$PGPASSWORD';
EOF

# Edit postgresql.conf to change listen address to '*':
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"


# Edit postgresql.conf to change port:
if [ ! -z "$PGPORT" ]
then
	sed -i "/port = /c\port = $PGPORT" "$PG_CONF"
fi


# Append to pg_hba.conf to add password auth:
echo "host    all             all             all                     md5" >> "$PG_HBA"


# Restart PostgreSQL for good measure
service postgresql restart


# create test db
cat << EOF | su - postgres -c psql
-- Create the database:
CREATE DATABASE $PGDATABASE WITH OWNER $PGUSER;
-- auto explain for analyse all queries and inside functions
LOAD 'auto_explain';
SET auto_explain.log_min_duration = 0;
SET auto_explain.log_analyze = true;
EOF


# Restart PostgreSQL for good measure
service postgresql restart

# JSON files for mock db
touch /var/tmp/yakchat.users.json
chmod 777 /var/tmp/yakchat.users.json
echo '{ "users": [] }' >> "/var/tmp/yakchat.users.json"

# Install yarn #FIXME: Weird error with npm
curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn

# Update npm
sudo npm install -g npm
sudo chown -R vagrant ~/.npm

# Install npm dependecies
cd /home/vagrant/yakchat-auth-server
yarn install

# TODO: iterate the deploy and import.json
display Load DDL and sample data
display find the deploy files at ${DB_DIR}
display list the files: $(find ${DB_DIR} -name '*.json' | sort)

for f in $(find -L ${DB_DIR} -name '*.json' | sort); do
  for s in $(cat ${f} | jq -r .deploy[].file); do
    file=$(dirname $f)'/'${s};
    case "$file" in
	  *.sh)   echo $0 running $file;  . "$file" ;;
	  *.sql)  echo $0 running $file; echo $file >> database.err;  su - postgres -c "psql --port=$PGPORT --dbname=$PGDATABASE" < "$file" 2>> database.err && echo ;;
	  *.dump) echo $0 running $file;  su - postgres -c "pg_restore --port=$PGPORT --disable-triggers --data-only --dbname=$PGDATABASE" < "$file" 2>> import.err && echo ;;
	  *)      echo $0 $file;;
    esac
  done
done;



# Tag the provision time:
date > "$PROVISIONED_ON"

echo "Successfully created postgres dev virtual machine with Postgres"
echo ""
print_db_usage
