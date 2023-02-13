---
title: Android SO 内存详细信息获取
date: 2022-01-07 22:41:00 +0800
categories: [Android,工具]
tags: [ADB]
---

## 获取内存方法一：dumpsys meminfo


```
在adb下输入如下命令：adb shell dumpsys meminfo <yourpakagename>
```

![](https://cdn.jsdelivr.net/gh/Rootjhon/img_note@main/1614154112282-1614154112276.png)

这种方法获取内存可能存在一个问题：获取内存不够精准，如果Android应用中的库文件，没有以.so后缀名结尾，那么这部分内存占用不会归为“.so mmap”中，而是归为"Other mmap"中。


## 获取内存方法二：smaps

在adb下输入如下命令：

1. adb -d shell ps | grep com.sohu.inputmethod.sogou | awk '{print$2;}'  //打印被测应用的进程id
1. adb -d shell su --command=\'cat /[PID]/smaps >/sdcard\'  //把PID对应的smaps文件拷贝到手机的sdcard上。注意必须用cat，不能用cp
1. adb –d pull /sdcard/smaps  //下载smaps文件
1. 解析smaps文件

![](https://cdn.jsdelivr.net/gh/Rootjhon/img_note@main/1614154130197-1614154130191.png)

文件结构：
 - 400ca000-400cb000：本段虚拟内存的地址范围
 - r-xp             ：文件权限，r（读）、w（写）、x（执行）、p表示私有，s代表共享，如果不具有哪项权限用"-"代替
 - 00000000         ：映射文件的偏移量
 - b3:11            ：文件设备号
 - 1345             ：被映射到虚拟内存文件的映索节点

![](https://cdn.jsdelivr.net/gh/Rootjhon/img_note@main/1614154141631-1614154141626.png)


## dumpsys meminfo 和 smaps的关系

dumpsys meminfo 命令下的 Pss、Shared Dirty、Private Dirty这三列的数据是读取smaps文件生成。