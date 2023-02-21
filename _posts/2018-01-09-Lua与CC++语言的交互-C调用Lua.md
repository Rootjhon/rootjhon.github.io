---
title: Lua与C\C++语言的交互-C调用Lua
date: 2018-01-09 16:43:52 +0800
categories: [Lua, 基础]
tags: []
---



# 前言

> 首先需要明白的是 C与 Lua 的虚拟堆栈。
> 引用 Lua 官方的解释：

>> **The Stack**
>>
>> >Lua uses a virtual stack to pass values to and from C. Each element in this stack represents a Lua value (nil, number, string, etc.).
>> >Whenever Lua calls C, the called function gets a new stack, which is independent of previous stacks and of stacks of C functions that are still active. This stack initially contains any arguments to the C function and it is where the C function pushes its results to be returned to the caller (see lua_CFunction).
>> >For convenience, most query operations in the API do not follow a strict stack discipline. Instead, they can refer to any element in the stack by using an index: A positive index represents an absolute stack position (starting at 1); a negative index represents an offset relative to the top of the stack. More specifically, if the stack has n elements, then index 1 represents the first element (that is, the element that was pushed onto the stack first) and index n represents the last element; index -1 also represents the last element (that is, the element at the top) and index -n represents the first element.

>> **Stack Size**
>> >When you interact with the Lua API, you are responsible for ensuring consistency. In particular, you are responsible for controlling stack overflow. You can use the function `lua_checkstack` to ensure that the stack has extra slots when pushing new elements.
>> >Whenever Lua calls C, it ensures that the stack has at least `LUA_MINSTACK` extra slots. `LUA_MINSTACK` is defined as 20, so that usually you do not have to worry about stack space unless your code has loops pushing elements onto the stack.
>> >When you call a Lua function without a fixed number of results (see `lua_call`), Lua ensures that the stack has enough size for all results, but it does not ensure any extra space. So, before pushing anything in the stack after such a call you should use `lua_checkstack`.


# C语言操作 Lua 全局变量（基本类型）

## 获取 Lua 全局变量

> C语言读取Lua中的全局变量需要两步：
> > - 将全局变量从`Lua Space`压入虚拟堆栈
> > - 从堆栈将全局变量读取到 `C Space` 中

> **在`Lua`和`C`的交互中，`Lua`无法看到和操作虚拟堆栈，仅在`C`语言中有操作堆栈的权利。**

----


> `Lua` 代码：
```lua
global_Num = 1789;
global_bool = true
global_Str = "thi is lua str."
print("Lua global_Num ", global_Num);
print("Lua global_bool ", global_bool);
print("Lua global_Str ", global_Str);
```

> C++代码：

```c++
void GetLua_Global(lua_State *varState)
{
	LUA_NUMBER tempLuaNumValue;
	/*从lua space 中将全局变量global_Arg读取出来放入虚拟堆栈中*/;
	lua_getglobal(varState,"global_Num");
	/*从虚拟堆栈中读取刚才压入堆栈的变量，-1表示读取堆栈最顶端的元素*/
	tempLuaNumValue = lua_tonumber(varState,-1);
	cout << "C global_Num " << tempLuaNumValue << endl;


	lua_getglobal(varState, "global_bool");
	cout << "C global_bool " << boolalpha << (bool)lua_toboolean(varState, -1) << endl;

	lua_getglobal(varState, "global_Str");
	cout << "C global_Str "  << lua_tostring(varState, -1) << endl;
}
```
>运行输出：
>> ![](https://fastly.jsdelivr.net/gh/Rootjhon/img_note@empty/16763661323421676366132029.png) 


## 设置 Lua 全局变量

> C++代码：

```c++
void SetLua_Global(lua_State *varState)
{
	lua_pushinteger(varState, 9);
	lua_setglobal(varState, "global_Num");

	lua_pushboolean(varState,false);
	lua_setglobal(varState,"global_bool");

	lua_pushstring(varState,"C space String");
	lua_setglobal(varState, "global_Str");

	GetLua_Global(varState);
}
```

>运行输出:
>> ![](https://fastly.jsdelivr.net/gh/Rootjhon/img_note@empty/16763661503401676366149880.png) 

#C语言调用Lua函数

 > Lua 代码：

```lua
function Luafun(varX,varY)
    print("Luafun x,y " .. varX,varY);
    return math.max(math.abs(varX),math.abs(varY))
end
```

> C代码：


```c++
void C_callLuaFun(lua_State *varState, double varX, double varY)
{
	luaL_dofile(varState, "C2Luafun.lua");

	/* 首先将lua函数从Lua Space放入虚拟堆栈中 */
	lua_getglobal(varState,"Luafun");
	/* 然后再把所需的参数入栈 */
	lua_pushnumber(varState, varX);
	lua_pushnumber(varState,varY);

	/*lua_pcall(lua_State,输入参数个数,返回参数个数,错误处理函数索引)*/;
	if (lua_pcall(varState,2,1,0) != 0)
	{
		luaL_error(varState, "error running lua function: $s", lua_tostring(varState, -1));
		return;
	}

	cout << "Return Form luafun " << lua_tonumber(varState, -1) << endl;

	/* 将返回值弹出堆栈，将堆栈恢复到调用前的样子 */
	lua_pop(varState,-1);
}
```

> 调用 `C_callLuaFun(L,-2,-7)` 运行结果:
> > ![](https://fastly.jsdelivr.net/gh/Rootjhon/img_note@empty/16763661643521676366163777.png) 



# C语言操作Lua Table 表

> Lua代码：

```lua
MyTable = {Title = "Blog",Url = "http://blog.csdn.net/admin_jhon",Author = "AdminJhon"}
function ShowCurTime()
    if MyTable.Time then
        print(os.date("%x", MyTable.Time))
    else
        print("MyTable not contain Time file.")
    end
end
```

> C\C++代码：

```c++
void Oper_LuaTable(lua_State *varState)
{
	luaL_dofile(varState,"luatable.lua");

	lua_getglobal(varState,"MyTable");

	/*取Lua表中某一个元素*/
	lua_pushstring(varState, "Url");
	lua_gettable(varState, -2);
	cout << "Url: " << lua_tostring(varState,-1)<<endl;

	/* 将结果出栈，结果出栈后栈顶元素为MyTable表*/
	lua_pop(varState,1);

	cout << "---------------------" << endl;
	lua_pushnil(varState);
	while (lua_next(varState, -2))
	{
		//这时值在-1（栈顶）处，key在-2处,表在-3。  
		cout << lua_tostring(varState, -2)<< ":" << lua_tostring(varState,-1) << endl;
		lua_pop(varState, 1);//把栈顶的值移出栈，让key成为栈顶以便继续遍历
	}

	/*修改Lua的表，在MyTable表中插入一个元素*/
	time_t tempCurTime;
	tempCurTime = time(NULL);

	lua_pushstring(varState,"Time");
	lua_pushinteger(varState,tempCurTime);
	lua_settable(varState,-3);

	lua_getglobal(varState,"ShowCurTime");
	lua_pcall(varState,0,0,0);

	/*弹出MyTable表,还原进入该函数前的堆栈状态*/
	lua_pop(varState,1);
}
```

> 运行结果:
> > ![](https://fastly.jsdelivr.net/gh/Rootjhon/img_note@empty/16763661783401676366177966.png) 



# 写在最后

> 例子只是一些简单的示例，核心思想都是通过操作虚拟堆栈实现的。