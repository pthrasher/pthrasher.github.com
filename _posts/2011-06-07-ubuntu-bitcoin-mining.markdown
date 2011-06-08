---
layout: post
title: Ubuntu 11.04 Natty 64bit Headless Bitcoin mining 11.5 ATI driver and 2.1 SDK
published: true
---

Hello, here's a guide on how to setup a bitcoin miner using linux, and the 2.1 SDK. 2.1 being favorable over 2.4 for some cards. I stole 99% of this from [here](http://forum.bitcoin.org/index.php?topic=9239.0)

*** Warning this may cause irreparable damage to your computer system, harm yourself and your family, burn down your house, neighborhood and city, generate untold amounts of carbon dioxide at your electric company and harm the polar bears and baby seals in the Arctic Circle.  I am NOT responsible if you try this or for any errors that may exist within this post.

Load a fresh Ubuntu Natty 11.04 64-bit Desktop with the latest updates and log into system with a user that has sudo permissions.
{% highlight bash %}
sudo apt-get remove nvidia-common
sudo apt-get install libqtgui4
{% endhighlight %}
Load python and other development tools
{% highlight bash %}
cd ~
sudo apt-get install python-setuptools python-numpy subversion g++ libboost-all-dev
{% endhighlight %}
Download and install ATI Driver 11.5 for Linux 64bit.
{% highlight bash %}
cd ~
wget http://www2.ati.com/drivers/linux/ati-driver-installer-11-5-x86.x86_64.run
sudo sh ati-driver-installer-11-5-x86.x86_64.run --buildpkg Ubuntu/natty
sudo dpkg -i *.deb
sudo apt-get -f install
sudo aticonfig -f --initial --adapter=all
sudo reboot
{% endhighlight %}
Verify that the ATI Driver is setup and running
{% highlight bash %}
cd ~
DISPLAY=:0 sudo fglrxinfo
{% endhighlight %}
Download and install bitcoin
{% highlight bash %}
cd ~
wget http://downloads.sourceforge.net/project/bitcoin/Bitcoin/bitcoin-0.3.21/bitcoin-0.3.21-linux.tar.gz
tar xzvf bitcoin-0.3.21-linux.tar.gz
chmod +x bitcoin-0.3.21/bin/64/bitcoin*
mkdir -p ~/.bitcoin
echo "rpcuser=user" >> ~/.bitcoin/bitcoin.conf
echo "rpcpassword=password" >> ~/.bitcoin/bitcoin.conf
{% endhighlight %}
Install python-jsonrpc
{% highlight bash %}
cd ~
svn checkout http://svn.json-rpc.org/trunk/python-jsonrpc
cd python-jsonrpc/
sudo python setup.py install
{% endhighlight %}
Download and install AMD APP SDK 2.1 for Linux 64bit.
{% highlight bash %}
cd ~
wget http://download2-developer.amd.com/amd/Stream20GA/ati-stream-sdk-v2.1-lnx64.tgz
tar xvzf ati-stream-sdk-v2.1-lnx64.tgz
echo export AMDAPPSDKROOT=${HOME}/ati-stream-sdk-v2.1-lnx64/ >> ~/.bashrc
echo export AMDAPPSDKSAMPLESROOT=${HOME}/ati-stream-sdk-v2.1-lnx64/ >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=${AMDAPPSDKROOT}lib/x86_64:${LD_LIBRARY_PATH}' >> ~/.bashrc
source ~/.bashrc
cd $AMDAPPSDKROOT
wget http://download2-developer.amd.com/amd/Stream20GA/icd-registration.tgz
cd /
sudo tar xfz $AMDAPPSDKROOT/icd-registration.tgz
{% endhighlight %}
Download, Compile and Install pyopencl-0.92
{% highlight bash %}
cd ~
wget http://pypi.python.org/packages/source/p/pyopencl/pyopencl-0.92.tar.gz
tar xzvf pyopencl-0.92.tar.gz
cd pyopencl-0.92
./configure.py --cl-inc-dir=${AMDAPPSDKROOT}include --cl-lib-dir=${AMDAPPSDKROOT}lib/x86_64
make
sudo make install
{% endhighlight %}
Download and Install Phoenix Miner 1.48
{% highlight bash %}
wget http://svn3.xp-dev.com/svn/phoenix-miner/files/phoenix-1.48.tar.bz2
tar xvf phoenix*.bz2
{% endhighlight %}
Verify that OpenCL is setup and running
{% highlight bash %}
cd ~
cd AMD-APP-SDK-v2.4-lnx64/bin/x86_64
./clinfo
{% endhighlight %}
Create a startminer script using code from below.  Make sure to substitute the correct home directory path, miner pool server, miner user and miner password.
{% highlight bash %}
cd ~
sudo touch /usr/local/bin/startminer.sh
sudo chmod 755 /usr/local/bin/startminer.sh
sudo vi /usr/local/bin/startminer.sh
{% endhighlight %}

Paste the following in:

{% highlight bash %}
# ${1} is used as a variable for the username, password and for the gpu device number.  Ex. mineruser0, minerpass0, Device=0 or mineruser1, minerpass1, Device=1
HOMEDIR=/home/user
MINERSERV=btcmine.com:8332
MINERUSER=mineruser@miner${1}
MINERPASS=minerpass${1}

export AMDAPPSDKROOT=${HOMEDIR}/ati-stream-sdk-v2.1-lnx64/
export AMDAPPSDKSAMPLESROOT=${HOMEDIR}/ati-stream-sdk-v2.1-lnx64/
export LD_LIBRARY_PATH=${AMDAPPSDKROOT}lib/x86_64:${LD_LIBRARY_PATH}

#Overclock GPU to 875Mhz
DISPLAY=:0 aticonfig --od-enable --adapter=all
DISPLAY=:0 aticonfig --od-setclocks=875,1000 --adapter=${1}
cd ${HOMEDIR}/phoenix-1.48
echo "Startming Miner: ${1}"
${HOMEDIR}/phoenix-1.48/phoenix.py -u http://${MINERUSER}:${MINERPASS}@${MINERSERV} -k phatk VECTORS BFI_INT AGGRESSION=12 DEVICE=${1}
{% endhighlight %}
Setup Headless Bitcoin Mining 
 *** Warning *** This will stop your computer from booting a graphical desktop and allow only text console or remote ssh access into the mining server. 
If you rely on a GUI for administration you may want to rethink this.
{% highlight bash %}
sudo apt-get install openssh-server
sudo apt-get install screen
sudo mv /etc/init/gdm.conf /etc/init/gdm.org
sudo vi /etc/init/startx.conf
{% endhighlight %}

Paste the following in:

{% highlight bash %}
description     "Start X Server for btc mining"
start on runlevel [2345]
stop on runlevel [!2345]
kill timeout 30
script
   exec /usr/bin/X 2>&1
end script
{% endhighlight %}

Then do:

{% highlight bash %}
   sudo vi /etc/init/btcminer_0.conf
{% endhighlight %}

Paste the following in:

{% highlight bash %}
description     "Start BTC Mining"
start on runlevel [2345]
stop on runlevel [!2345]
kill timeout 30
script
   LOGINUSER=ChangeToMyLoginUser
  #Wait 30 seconds to make sure X is started.
  sleep 30
  exec /usr/bin/screen -dmS gpu0 su -c '/usr/local/bin/startminer.sh 0' ${LOGINUSER}
end script
{% endhighlight %}

Then do:

{% highlight bash %}
   sudo vi /etc/init/btcminer_1.conf
{% endhighlight %}

Paste the following in:

{% highlight bash %}
description     "Start BTC Mining"
start on runlevel [2345]
stop on runlevel [!2345]
kill timeout 30
script
LOGINUSER=ChangeToMyLoginUser
#Wait 35 seconds to make sure X is started.
sleep 35
   exec /usr/bin/screen -dmS gpu1 su -c '/usr/local/bin/startminer.sh 1' ${LOGINUSER}
end script
{% endhighlight %}
How to access the miner server

ssh into the mining server as your normal login user.
`sudo screen -r gpu0` or `sudo screen -r gpu1`

To disconnect from screen Control-A + Control-D.

How to check the GPU temperatures

ssh into mining server as your normal login user.
`DISPLAY=:0 sudo aticonfig --odgt --adapter=all`

How to monitor your screens on an Xterminal on the main Xwindows console on boot up.
{% highlight bash %}
sudo vi /etc/init/btcmonitor_0.conf
{% endhighlight %}

Paste the following in:

{% highlight bash %}
description     "Start BTC Monitor 0"
start on runlevel [2345]
stop on runlevel [!2345]
kill timeout 30
script
  LOGINUSER=ChangeToMyLoginUser
  export DISPLAY=:0
  #Wait 40 seconds to make sure X is started.
  sleep 40
  exec  /usr/bin/xterm -geometry 80x40+0+0 -e "/usr/bin/screen -d -r gpu0"
end script
{% endhighlight %}

Then do:

{% highlight bash %}
sudo vi /etc/init/btcmonitor_1.conf
{% endhighlight %}


Paste the following in:

{% highlight bash %}
description     "Start BTC Monitor 1"
start on runlevel [2345]
stop on runlevel [!2345]
kill timeout 30
script
  LOGINUSER=ChangeToMyLoginUser
  export DISPLAY=:0
  #Wait 45 seconds to make sure X is started.
  sleep 45
  exec  /usr/bin/xterm -geometry 80x40+500+0 -e "/usr/bin/screen -d -r gpu1"
end script
{% endhighlight %}