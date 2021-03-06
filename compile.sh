set -e
scheme="$1" #
VERSION="2.13.3"
TAR="pari-$VERSION.tar.gz"
URL="https://pari.math.u-bordeaux.fr/pub/pari/unix/$TAR"
#MD5="6afe748a472c33ae8787a5034d7742a9"

echo "==> Install system packages"
apt-get install -y build-essential libgmp3-dev libreadline-dev tar wget
#gnupg

echo "==> Download sources"
mkdir -p /tmp
cd /tmp
wget -nv "$URL"
#wget -nv "$URL.asc"
#gpg --import /texlive_pgp_keys.asc
#gpg --verify ./install-tl-unx.tar.gz.sha512.asc

#echo "$MD5" | md5sum -c - 
mkdir -p pari
tar --strip-components 1 -zxf "$TAR" -C pari

cd pari

# Install additional packages for full scheme
if [ "$scheme" == "full" ]; then
    echo "==> Get additional packages"
    wget -nv https://pari.math.u-bordeaux.fr/pub/pari/packages/seadata.tgz
    tar xzf seadata.tgz
    wget -nv https://pari.math.u-bordeaux.fr/pub/pari/packages/galpol.tgz
    tar xzf galpol.tgz
    wget -nv https://pari.math.u-bordeaux.fr/pub/pari/packages/galdata.tgz
    tar xzf galdata.tgz
    wget -nv https://pari.math.u-bordeaux.fr/pub/pari/packages/elldata.tgz
    tar xzf elldata.tgz
fi
echo "==> Compile Pari/GP"
./Configure
make -j gp
make install
echo "==> Done"

echo "==> Clean up"
cd /tmp
rm -rf pari
rm $TAR
 
