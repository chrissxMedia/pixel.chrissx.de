---
title: Big (and uncommon) audio interfaces on Linux (PulseAudio)
pub: 2022-12-27
lang: en
---

When trying to use a "big" USB audio interface (i.e. one with many in- and outputs) on Linux,
you might be experiencing problems like only some of your in- and outputs working, none
working at all, etc. This is because, while PulseAudio works very well with commodity hardware,
it just doesn't know your way too expensive interface. However, in a few minutes you can tell
it how to deal with it.

<!-- TODO: update on my clarett situation -->

First, you need to know the vendor and product ID of your interface. For that, you can use `lsusb`:

```sh
$ lsusb | grep Focusrite
Bus 001 Device 006: ID 1235:820b Focusrite-Novation Clarett+ 4Pre
```

Then you can tell `udev` that you want special treatment for your special interface.
For that you need to create a rules file in one of its configuration directories, like
`/lib/udev/rules.d/91-pulseaudio.rules`. It should look like this, substituting `1235` and
`820b` for your IDs:

```c
SUBSYSTEM!="sound", GOTO="pulseaudio1_end"
ACTION!="change", GOTO="pulseaudio1_end"
KERNEL!="card*", GOTO="pulseaudio1_end"

SUBSYSTEMS=="usb", ATTRS{idVendor}=="1235", ATTRS{idProduct}=="820b", ENV{PULSE_PROFILE_SET}="big-interfaces.conf"

LABEL="pulseaudio1_end"
```

Now, PulseAudio will look for profiles in `/usr/share/pulseaudio/alsa-mixer/profile-sets/big-interfaces.conf`.
This is, finally, where you can have some fun. A simple example to just get stereo output and
four inputs, with the first two being one stereo input, looks like this:

```ini
[General]
auto-profiles = no

[Mapping analog-out]
description = Analog Outputs
device-strings = hw:%f
channel-map = left,right
direction = output

[Mapping analog-in]
description = Analog Inputs
device-strings = hw:%f
channel-map = left,right,aux0,aux1
direction = input

[Profile output:analog-out+input:analog-in]
description = Analog Stereo
output-mappings = analog-out
input-mappings = analog-in
```

The exact configuration of course depends on your specific hardware and needs. Once you've configured it to your liking, you need to tell `udev` to re-setup your interface and restart PulseAudio:

```sh
$ sudo udevadm trigger -ssound
$ pulseaudio -k
```
