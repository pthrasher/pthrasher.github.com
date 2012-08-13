---
layout: post
title: Ubuntu 11.04 64bit Headless Bitcoin Mining 11.5 ATI and 2.1 SDK
published: false
hckrnws: http://news.ycombinator.com/item?id=2872985
---

Hello, here's a guide on how to setup a bitcoin miner using linux, and the 2.1 SDK. 2.1 being favorable over 2.4 for some cards. I stole 99% of this from [here](http://forum.bitcoin.org/index.php?topic=9239.0)

*** Warning this may cause irreparable damage to your computer system, harm yourself and your family, burn down your house, neighborhood and city, generate untold amounts of carbon dioxide at your electric company and harm the polar bears and baby seals in the Arctic Circle.  I am NOT responsible if you try this or for any errors that may exist within this post.

That said, the system I originally wrote this for had 4x5850's. This guide is really only meant for the 4xxx/5xxx ati series cards. 6xxx seems to work best on 2.4 sdk, and latest driver... 4/5xxx work best with 2.1 and 10.11

Please consider throwing me some money if this helps you make any. :-) 1GAAZKQh1cHqCR5GWkghRYzXtr21C9ZbaG

Load a fresh Ubuntu Natty 11.04 64-bit Desktop with the latest updates and log into system with a user that has sudo permissions.
{% highlight bash %}
sudo apt-get remove nvidia-common
sudo apt-get install libqtgui4
{% endhighlight %}
Download and install ATI Driver 11.5 for Linux 64bit. (alternate 10.11 instructions below)
{% highlight bash %}
cd ~
wget http://www2.ati.com/drivers/linux/ati-driver-installer-11-5-x86.x86_64.run
sudo sh ati-driver-installer-11-5-x86.x86_64.run --buildpkg Ubuntu/natty
sudo dpkg -i *.deb
sudo apt-get -f install
sudo aticonfig -f --initial --adapter=all
sudo reboot
{% endhighlight %}

Alternatively, you may wish to download and install ATI Driver 10.11:
(this is currently untested, but should work. If it does, please let me know in the comments.)
{% highlight bash %}
cd ~
wget http://dl.dropbox.com/u/4730227/ati-driver-installer-10-11-x86.x86_64.run
sudo sh ati-driver-installer-10-11-x86.x86_64.run --buildpkg Ubuntu/natty
sudo dpkg -i *.deb
sudo apt-get -f install
sudo aticonfig -f --initial --adapter=all
sudo reboot
{% endhighlight %}

Verify that the ATI Driver is setup and running (disclaimer... this never
worked for me)
{% highlight bash %}
cd ~
DISPLAY=:0 sudo fglrxinfo
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
Download and install Diablo Miner (I've had the best mhash's by far with diablo on 2.1)
{% highlight bash %}
cd ~
wget http://adterrasperaspera.com/images/DiabloMiner.zip
unzip DiabloMiner.zip
{% endhighlight %}

Create a startminer script using code from below.  Make sure to substitute the correct home directory path, miner pool server, miner user and miner password.

I had 4 cards in my computer, so I created 4 scripts... Adjust for your own
setup.

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
MINERSERV=mining.eligius.st
MINERPORT=8337
MINERUSER=mybitcoinaddress
MINERPASS=arbitrarypassword

export AMDAPPSDKROOT=${HOMEDIR}/ati-stream-sdk-v2.1-lnx64/
export AMDAPPSDKSAMPLESROOT=${HOMEDIR}/ati-stream-sdk-v2.1-lnx64/
export LD_LIBRARY_PATH=${AMDAPPSDKROOT}lib/x86_64:${LD_LIBRARY_PATH}

#Overclock GPU to 875Mhz
DISPLAY=:0 aticonfig --od-enable --adapter=all
DISPLAY=:0 aticonfig --od-setclocks=875,1000 --adapter=${1}
cd ${HOMEDIR}/DiabloMiner
echo "Startming Miner: ${1}"

DISPLAY=:0 ${HOMEDIR}/DiabloMiner/DiabloMiner-Linux.sh -u ${MINERUSER} -p ${MINERPASS} -l ${MINERSERV} -r ${MINERPORT} -D ${1} -v 2 -w 256
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
