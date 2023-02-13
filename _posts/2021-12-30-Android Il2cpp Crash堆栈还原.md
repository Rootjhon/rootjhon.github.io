---
title: Android Il2cpp Crash堆栈还原
date: 2021-12-30 22:41:00 +0800
categories: [Unity,IL2CPP]
tags: [Crash定位]

# Ref
# - https://developer.android.com/ndk/guides/ndk-stack?hl=zh-cn
# - https://www.nevermoe.com/2016/08/10/unity-metadata-loader/
# - https://support.unity3d.com/hc/zh-cn/articles/115000292166-%E4%BD%BFAndroid%E5%A5%94%E6%BA%83%E6%97%A5%E5%BF%97%E7%AC%A6%E5%8F%B7%E5%8C%96
# - https://www.xuanyusong.com/archives/4441
# - https://support.unity3d.com/hc/en-us/articles/115000292166-Symbolicate-Android-crash
---

## 如何将内存地址转为可读的函数名
```bash
${addr2line.exe} -a -C -f -e "C:/Program Files/Unity/Hub/Editor/2018.4.0f1/Editor/Data/PlaybackEngines/AndroidPlayer/Variations/il2cpp/Development/Symbols/armeabi-v7a/libunity.sym.so" 0043a05c
```

Windows批处理

```bash
@ECHO OFF
SET Ad2LinePath="addr2line.exe"
SET LinInfo="lineinfo.txt"
ECHO "==============================="
"%Ad2LinePath%" @"%LinInfo%"
ECHO "==============================="
PAUSE
```
lineinfo.txt

```
 -a -C -f -e "F:/WorkProject/_Develop/program/client/trunk/game/Prj-G/addr2lineTools/libil2cpp.sym" 01a23918 00f45b68 01c335f0 00488808 019df9ec
```
{: .nolineno file="lineinfo.txt" }

----

## **问题**

在libil2cpp.so上进行Android（IL2CPP）生产构建时，我想要在发生的崩溃中表征一个调用堆栈，但是一直无法找到该库的符号。

## **原因**

该符号文件每次在ProjectFolder/Temp/ directory下构建时被创建，当编辑器应用退出后被移除，所以您可能看不到它们。

## **解决方案**

每次构建后，您可以从下述位置获得符号：

 - ProjectFolder\Temp\StagingArea\libs\x86\libil2cpp.so.debug
 - ProjectFolder\Temp\StagingArea\libs\armeabi-v7a\libil2cpp.so.debug

确保在关闭Unity编辑器之前将符号文件复制到不同的文件夹中。您也可以使用下面的后期构建脚本：

```c#
using UnityEngine;
using System.Collections;
using UnityEditor.Callbacks;
using UnityEditor;
using System.IO;
using System;

public class MyBuildPostprocessor  
{
        [PostProcessBuildAttribute()]
        public static void OnPostprocessBuild(BuildTarget target, string pathToBuiltProject)
        {
                if (target == BuildTarget.Android)
    		        PostProcessAndroidBuild(pathToBuiltProject);
        }

        public static void PostProcessAndroidBuild(string pathToBuiltProject)
        {
                UnityEditor.ScriptingImplementation backend = UnityEditor.PlayerSettings.GetScriptingBackend(UnityEditor.BuildTargetGroup.Android) as UnityEditor.ScriptingImplementation;

                if (backend == UnityEditor.ScriptingImplementation.IL2CPP)
                {
                        CopyAndroidIL2CPPSymbols(pathToBuiltProject, PlayerSettings.Android.targetDevice);
                }
        }

        public static void CopyAndroidIL2CPPSymbols(string pathToBuiltProject, AndroidTargetDevice targetDevice)
        {
                string buildName = Path.GetFileNameWithoutExtension(pathToBuiltProject);
                FileInfo fileInfo = new FileInfo(pathToBuiltProject);
                string symbolsDir = fileInfo.Directory.Name;
                symbolsDir = symbolsDir + "/"+buildName+"_IL2CPPSymbols";

                CreateDir(symbolsDir);

                switch (PlayerSettings.Android.targetDevice)
                {
                      case AndroidTargetDevice.FAT:
                        {
                            CopyARMSymbols(symbolsDir);
                            CopyX86Symbols(symbolsDir);
                            break;
                        }
                      case AndroidTargetDevice.ARMv7:
                        {
                            CopyARMSymbols(symbolsDir);
                            break;
                        }
                      case AndroidTargetDevice.x86:
                        {
                            CopyX86Symbols(symbolsDir);
                            break;
                        }
                      default:
                      break;
                }
        }


        const string libpath = "/../Temp/StagingArea/libs/";
        Const string libFilename = "libil2cpp.so.debug";
        private static void CopyARMSymbols(string symbolsDir)
        {
                string sourcefileARM = Application.dataPath + libpath + "armeabi-v7a/" + libFilename;
                CreateDir(symbolsDir + "/armeabi-v7a/");
                File.Copy(sourcefileARM, symbolsDir + "/armeabi-v7a/libil2cpp.so.debug");
        }

        private static void CopyX86Symbols(string symbolsDir)
        {
                string sourcefileX86 = Application.dataPath + libpath + "x86/libil2cpp.so.debug";
                File.Copy(sourcefileX86, symbolsDir + "/x86/libil2cpp.so.debug");
        }

        public static void CreateDir(string path)
        {
                if (Directory.Exists(path))
                    return;

                Directory.CreateDirectory(path);
        }
} 
```