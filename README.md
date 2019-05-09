# tacky
[![pipeline status](https://img.shields.io/travis/com/kujiale/tacky/master.svg?style=flat-square)](https://travis-ci.com/kujiale/tacky)
[![npm version](https://img.shields.io/npm/v/@tacky/store.svg?style=flat-square)](https://www.npmjs.com/package/@tacky/store)
[![npm downloads](https://img.shields.io/npm/dm/@tacky/store.svg?style=flat-square)](https://www.npmjs.com/package/@tacky/store)

## 介绍
**tacky** 是一个基于 **react** 的轻量级前端框架，目前只有一个 **@tacky/store** 状态管理框架，以下文档都是针对这个框架的

### 谁在用？
- [酷家乐](https://www.kujiale.com/)

### 快速上手
一个最简单的例子：
```js
// @domain.js
import { Domain, state, mutation } from '@tacky/store';

class MyDomain extends Domain {
  @state() list = [];

  @mutation
  updateList(obj) {
    this.list.push(obj);
  }
}

export default new MyDomain();

// component.jsx
import { Component } from 'react';
import { stick } from '@tacky/store';
import $ins from './@domain';

@stick()
export default class extends Component {
  render() {
    return (
      <div>
        <span>{JSON.stringify($ins.list)}</span>
        <button onClick={() => $ins.updateList('aaa')}>add</button>
      </div>
    );
  }
}

// entry.js
import React from 'react';
import Tacky from '@tacky/store';
import Layout from './component';

Tacky.render(<Layout />, '#app');
```

## 框架说明
以下简单介绍几个业界比较流行的框架和 **@tacky/store** 框架，让不了解状态管理的童鞋可以快速找到自己适合的框架。

### react-redux
**react-redux** 是比较经典的状态管理框架，最优秀的地方在于可扩展性和可预测性，个人使用感受来说适合一些复杂稳定的业务，并且还是比较考验架构设计的，**redux**（以下代指 **react-redux**） 相对来说还是给了开发者比较多折腾的空间，核心代码不多，扩展能力强，但直接裸用 **redux** 开发链路较长，心智负担较多，效率不算很高。

[如何评价数据流管理框架 redux？](https://www.zhihu.com/question/38591713)

### react-redux 架构图
![redux](https://qhstaticssl.kujiale.com/as/ddae6a4d54ba1e65b5833508fd59ff5c/redux.png)

### dva
**dva** 是基于 **redux** 的状态管理框架，但它不仅仅是个状态管理框架，还包含了 cli、router 等能力，配合 **umi** 这套整体解决方案，看起来对于快速搭建应用还不错，它的能力非常强大，集合了多个框架再封装，几乎不怎么再需要添加其他三方库了，不过因为直接依赖了一些三方库，更新维护成本和难度还是挺高的，在社区上不算是很活跃，概念也非常多，适合一些对 redux 系列库比较熟悉的开发者。

[如何评价前端应用框架 dva？](https://www.zhihu.com/question/51831855?from=profile_question_card)

### dva架构图
![dva](https://qhstaticssl.kujiale.com/as/99322f8bdbfcaa47da9ce3cdd5854075/dva.png)

### mobx-react
**mobx**（以下所有代指 **mobx-react**）和 **vue** 的写法有相似之处。很多人说，**mobx-react** 是给 **vue** 的狂热粉丝用来写 **react** 的，这个说法很有趣，但在实际普通 web 业务开发中，不可否认它们的写法确实更无脑也更方便，很惊艳很容易上手，概念也比较少，还是挺适合大部分 web 项目的。不过会比较难测试、难调试，流程复杂的项目自描述能力也比较差，更容易写出过程式代码，扩展和生态都不算是很好，但 mobx 的作者更新还是比较频繁，现在能力也越来越强大了。

[如何评价数据流管理框架 mobx？](https://www.zhihu.com/question/52219898)

### mobx-react架构图
![mobx](https://qhstaticssl.kujiale.com/as/654ae258534c4b8c8f5b21f8f1282e52/mobx.png)

### vuex
**vuex** 是 **vue** 的状态管理框架，整个流程上的理念基本和 **redux** 没有太大区别，主要的区别是在 **vue** 中可以直接更新 state，不需要拷贝，因为这个过程并没有像 reducer 纯函数那样具有明确的输入输出，所以 **vuex** 给它起了个名字，叫做 mutation，因为概念上任何一次相同的输入都得到相同的输出才更符合 reducer 纯函数的特性，所以“突变”更加适合 **vuex** 中的更新行为。

### vuex架构图
![vuex](https://qhstaticssl.kujiale.com/as/e738c068c874a74d0192c83b039980e9/vuex.png)

### @tacky/store
**@tacky/store** 也是一个状态管理框架，它的灵感主要还是来源于以上框架，**@tacky/store** 当时设计的初衷只是想尽可能统一公司的状态管理框架，用友好易懂的方式满足一部分人的使用习惯和需求，把一些优秀框架的思想融入进来强化整合功能，并提供一些周边工具来进一步提效，你要说有什么颠覆那是很难的，不过是站在巨人的肩膀上折腾罢了。

- 用法上有点像 **mobx**，采用了 class 和装饰器来设计领域模型
- 中间件系统沿袭了 **redux**，让更新流程得以扩展
- 融入了 **vue** 中的计算属性思想，取代 **reselect** 的功能（待做）
- 融入了 **vuex** 中 mutation 的写法，可以同时支持 reducer 和 mutation 的写法，满足不同人的使用习惯和迁移老项目的需求
- 提供便利的浏览器持久化功能（待做）
- 默认提供处理副作用的装饰器，对异步场景更友好
- 提供各种描述符，来处理竞态和复杂更新流程（待做）
- 融入了依赖收集思想前置收集状态和模板的依赖关系，来提高后续的更新效率
- 更加简易的初始化 API，只暴露修改配置的能力
- 编辑器更友好的提示，减少心智负担
- 支持 typescript
- 支持 react hooks（待做）
- 支持时间旅行
- 支持一个领域模型多个实例隔离状态的功能
- 支持重置到初始值、销毁领域模型的功能
- 底层没有直接依赖任何三方开源框架，是个纯粹、精简的状态管理解决方案，升级维护都比较容易
- 友好的文档和最佳实践，对于没有用过状态管理框架的新手来说，还算比较容易上手

### @tacky/store架构图
![@tacky/store](https://qhstaticssl.kujiale.com/as/9eb079eaa108e03f947cd8a88097deaf/sticky.png)

## 使用说明

### 安装
```
$ npm install --save @tacky/store

$ yarn add @tacky/store
```

> 本框架必须使用 decorator，你需要安装 transform-decorators-legacy, transform-class-properties, babel7 的话用 @babel/plugin-proposal-decorators

### 依赖
**@tacky/store** 依赖 **react-dom, react 16或以上版本**

### 兼容性
**@tacky/store** 支持大部分现代浏览器，由于使用了 Proxy API，在 IE 和一些低版本浏览器下不支持，还使用了 Reflect、Symbol、Promise、WeakMap API，如需兼容需要自行引入 polyfill

### 许可证
[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019-present, kujiale, feifan

## API & 概念

### domain
domain 本质就是一组状态和业务逻辑的聚合，我们称之为一个领域模型或者是 **mobx**、**redux** 中的 store、model 等叫法，里面包含 state、reducer、effect、mutation 等物料，一个应用可以有很多个不同的 domain。

不管是 store 还是 domain，只是一种概念，本质上它们都是为了从视图层中剥离业务逻辑，并且得到一定程度的解耦、复用和互相依赖，至于如何设计，这就是使用者的事情了，你可以采用 VIPER、MVP 架构、传统 MVC 架构或是其他的设计思想来组织你的应用，甚至如果你的业务场景真的具有领域模型这个概念，并且在后端和产品层面都可以遵守领域模型，那也可以尝试设计成领域模型架构，如果不存在，仅仅是单纯业务逻辑的剥离也未尝不可，框架并不限制这些。不过 **@tacky/store** 还是会提供一份最佳实践的设计，在文档最后，仅供参考。

如下代码所示，这就是一个 domain，其实就是一个普通的 class 继承了 **@tacky/store** 提供的 Domain 父类：
```js
import { Domain, state, reducer, effect, mutation } from '@tacky/store';

export class MyDomain extends Domain {
  @state() result = 0;

  @mutation
  isLoaded(result) {
    if (result) {
      this.result = result;
    }
  }

  @reducer
  updateResult(state, index) {
    return fromJS(state).setIn(['result'], index).toJSON();
  }

  @effect
  async fetchData() {
    const { result } = await $API.get('/api/balabala');
    this.isLoaded(result);
  }
}
```

每个 domain 都可以拥有多个实例，不同实例之间的状态是隔离的，这在某些特殊场景下会比较有用，但通常它是单例的。
```js
import { Domain, state, reducer, effect, mutation } from '@tacky/store';

class MyDomain extends Domain {
  @state() isLoading = false;

  @mutation
  updateLoading() {
    this.isLoading = true;
  }
}

const $ins1 = new MyDomain();
$ins1.updateLoading();
$ins1.isLoading; // true
const $ins2 = new MyDomain();
$ins2.isLoading; // still be false
```

### state
在 **mobx** 中，会用 @observable 的装饰器来表示这是一个响应式状态属性，而在 **@tacky/store** 中，通过 @state 的装饰器来声明，如下代码所示：
```js
export class MyDomain extends Domain {
  @state() isLoading = false;
  @state() list = [];
}
```
暂未实现：state 装饰器可传入参数，比如 @state('localStorage', 1000)，可以把状态持久化

### reducer & mutation
在 **redux** 中，我们写的最多的就是 reducer，它是用来处理数据更新操作，传统意义来说，reducer 是一个具有输入输出的纯函数，它更像是一个物料，或是一个早就定制好的流水线，任何相同的输入，一定会得到相同的输出，它的执行不会改变它所在的环境，外部环境也不应该影响它，这种特性似乎非常适合 **react** 数据状态机的思想，每一个 snapshot 都对应着一份数据，数据变了，就产生了新的 snapshot。

在 **mobx** 中，没有 reducer，它从另一个思想，响应式编程的角度来试图解决状态的传递，本质上对原始引用做了一份代理，任何一次更新都会直接反馈到原始引用，并广播到所有依赖过的地方并触发它们，类似 **vuex** 中的 mutation 的概念，它是一种突变，不是一个纯函数。

从关注点精度来说，**mobx** 是属性级别的，而 **redux** 是某个容器的全局状态机，**redux** 虽然可以通过 combine 来降低关注点，但使用上配合 **immutable** 还是比 **mobx** 要麻烦一些，易用性上这一点 **mobx** 更好，但精度过细也有缺点，比如我需要做一组操作的状态回退，或是自描述一套流程，**redux** 的 reducer 似乎更合适也更直观一些，孰优孰劣，真的很难说，所以在 **@tacky/store** 中选取了两者的优点，提供了 reducer 和 mutation 两种写法，并且可以混用（虽然一般情况你并不会混用），但依然将更新逻辑和业务流程逻辑隔离开，有助于更好的抽象、复用复杂一些的更新计算逻辑，使用形式如下：
```js
// @tacky/store
class MyDomain extends Domain {
  @state() currentIdx = 0;
  @state() array = [];

  @mutation
  changeIdx1(idx) {
    this.currentIdx = idx;
    this.array.push('aaa');
  }

  @reducer
  changeIdx2(state, idx) {
    return fromJS(state).setIn(['currentIdx'], idx).toJSON();
  }
}
// redux reducer
const commonReducer = (state = {}, action) => {
    switch (action.type) {
      case 'LOADING':
        return {
          isFetching: true
        }
      case 'LOADED':
        return {
          isFetching: false
        }
      default:
        return state
    }
}
// mobx action
class CommonStore {
    @observable tab = 'info';

    @action changeTab = (tab) => {
      this.tab = tab;
    }
}
```

#### $update
上面这个例子的更新计算逻辑比较简单，并不是很好，实际上对于复杂一些的逻辑这样写是比较清晰的，但简单的赋值更新有些繁琐，**@tacky/store** 提供了内置的操作符（语法糖）来解决这个问题

```js
class MyDomain extends Domain {
  @state() currentIdx = 0;
  @state() array = [];

  @effect
  changeState(idx) {
    this.$update({
      currentIdx: idx,
      array: ['aaa'],
    });
  }
}
```

> 注意：每个 domain 的 reducer/mutation 只能更新当前 domain 的 state，不关心其他 domain 的 state，这有助于分解模块

> 和 redux 一样，更新 domain 中的 state 是一个同步的过程，每一次触发 reducer/mutation 操作，如果状态改变了，都会触发一次依赖到此操作状态的模板的 forceUpdate() 方法来执行 reRender

> 要在 mutation 中更新数组状态，可以直接使用数组原生 API，也可以直接操作原数组，都能触发重新渲染，这是因为 @tacky/store 使用了 Proxy 的能力

> 你只能在 mutation 中直接对属性赋值，在其他函数中直接对 state 修饰过的属性赋值会得到一个错误，You cannot assign value to state by \'this.\' directly. Please use mutation to update state，这是为了防止非法操作导致状态和视图不同步的情况出现.

### effect
在数据流框架中都有“副作用”这个概念，也就是说在一个 dispatch 行为中会同时触发多次数据更新操作并且需要更新多次 UI，通常这种行为会发生在一些异步接口调用和一些分发更新操作的流程中，在 **redux** 中，会使用一些中间件来解决此类问题，比如 **redux-thunk**、**redux-saga**、**redux-observable** 等，在 **mobx** 中，side effect 统一可以交给 @action 装饰器修饰的函数处理，它可以是同步也可以是异步的，**@tacky/store** 因为考虑到 **redux** 中间件机制的可扩展性，也采用了 **redux** 的中间件机制，以适应可能需要控制 action 触发过程的需求，默认情况下，**@tacky/store** 会提供 effect 中间件，这样就可以处理副作用了，使用方法如下：
```js
import { throttle, bind } from 'lodash-decorators';

class MyDomain extends Domain {
  isLoading = false;
  readList = [];

  @mutation
  isLoaded({ readList }) {
    if (readList) {
      this.readList = readList;
    }
    this.isLoading = false;
  }

  @reducer
  isLoading(state) {
    return fromJS(state).setIn(['isLoading'], true).toJSON();
  }

  @throttle(300) // 可以用一些装饰器来控制函数执行
  @bind()
  @effect
  async fetchReadList() {
    this.isLoading();
    const { readList } = await API.get('/api/balabala');
    this.isLoaded({ readList });
  }
}
```
> 在 effect 函数中不能直接通过 this 去修改状态，只能读取，修改必须要通过 reducer/mutation，或者使用 $update 语法糖也可以简化。当初这么设计是为了遵守更新过程与业务流程逻辑的分离，如果不强制可能会导致过程式的代码很多，写出完全不考虑复用性和整洁度的代码，此举确实会导致写起来稍微麻烦，但看起来对于更新流程的描述更清晰了

> effect 修饰的函数大部分情况下都是异步的，但也不排除分发了多个同步的 reducer/mutation 操作，多个同步代码顺序是可以保证的，后面的代码可以拿到更新后的状态，异步的操作不可以，必须用 await 等待完成后才能拿到最新的状态。后续也会提供一些合并多个同步更新操作的语法糖。

### operator（暂未实现，敬请期待）
上面的 effect 跟一个普通的 async 函数似乎并无区别，为什么还要单独多出一个概念呢？因为后续 **@tacky/store** 会把一些特殊的操作符挂载到 effect 修饰过的函数里，专门处理异步流程，如果所有操作都是同步的，那就没有 operator（操作符）什么事情了，但现实情况是异步任务非常多，虽然说大多数场景 async 函数就已经足够了，但在一些异步任务竞争的场景还是不够用的，比如在异步任务还没完成的时候，下几次触发又开始了，并且这几个异步任务之间还有关联逻辑，如何控制调度这些异步任务，就需要通过各种 operator 来处理了。

### computed（暂未实现，敬请期待）
有的业务比较复杂，需要根据某几个原始 state 的变化自动触发算法，计算出视图真正需要的状态，在模板中放入太多的逻辑会让模板过重且难以维护，并且如果原始 state 没有发生变化，则不重复执行耗时的计算，直接返回上一次计算过的结果，这时候就需要用到 computed 装饰器，如下代码所示：

<!--
// 在 presenter 中处理跨 domain 的计算属性
// @register({
//   name: 'presenter',
//   deps: ['column', 'tag'],
// })
// class presenter {
//   @computed
//   get currentTagColumnList() {
//     const columnList = this.$column.columnList;
//     const currentTagId = this.$tag.currentTagId;
//     return columnList.filter(column => column.tagId === currentTagId);
//   }

//   @effect
//   async reverseComputed() {

//   }
// }

// computed 修饰的函数返回的状态是只读的，只会根据原始 state 进行变化，不能直接通过 reducer/mutation 或者 this 来修改，@tacky/store 希望计算过程跟数据流一样是单向的，如果需要逆向算法，还是写一个通用 effect 来逆向分解更新原始 state 更好维护一些，通过监听互相触发更新虽然很方便，但过于 magic，比如 vue 的 watch，这种代码多了之后对排查和维护是灾难性的
-->

### stick
**@tacky/store** 中的 @stick 装饰器，有点类似于 **mobx** 的 @observer，它的作用就是标记这个组件需要自动同步状态的变更。它实际上是包裹了原始组件，返回了一个新的组件，将大部分同步状态的链接细节给隐藏起来。要使用 domain 中的状态和函数，只需要将 domain 实例化，并直接访问实例上的属性和函数，如下所示：
```js
import $column from '@domain/dwork/design-column/column';
import $tag from '@domain/dwork/design-column/tag';
import $list from '@presenter/dwork/column-list/list';

@stick()
export default class Banner extends React.Component {
  componentDidMount() {
    $list.initLayoutState();
  }

  render() {
    return (
      <React.Fragment>
        <Radio.Group value={$tag.currentTagId} onChange={$list.changeTag}>
          <Radio value="">热门推荐</Radio>
          <For
            each="item"
            index="idx"
            of={$tag.tags}
          >
            <Radio key={idx} value={item.id}>{item.tagName}</Radio>
          </For>
        </Radio.Group>
        <Skeleton
          styleName="column-list"
          when={$column.columnList.length > 0}
          render={<Columns showTag={$tag.currentTagId === ''} data={$column.columnList} />}
        />
        <Pagination
          current={$column.current}
          defaultPageSize={$column.pageSize}
          totalPage={$column.totalPage}
          onChange={$list.changePage}
          hideOnSinglePage={true}
        />
      </React.Fragment>
    );
  }
}
```

当然你也可以把实例挂载到组件的 props 上来向下传递，这个取决于你是如何设计一个复用的业务组件的，以及复用的粒度是怎么样的，挂载到 props 上复用能力无疑是更好的，但使用者也需要手工“装配”模型和视图了，如果不使用 ts，也会丧失编辑器提示。

### render
```typescript
type render = (
  component: React.Component,
  querySelector: string,
  callback: () => void
) => void
```
在 **mobx** 和 **redux** 中都没有干预 ReactDOM.render，而在 **@tacky/store** 中提供了 Tacky.render 函数来将组件渲染到 dom 上，实际上只是对 ReactDOM.render 函数的封装，将 **@tacky/store** 中的一些初始化细节给隐藏起来，实际上 render 函数主要做了根据配置决定是否加载内置中间件，初始化 store 以及把根组件渲染到对应节点，使用方式如下所示：
```js
Tacky.render(<Layout />, '#app', () => {
  // ReactDOM.render 的 callback
});
```
当然如果有需要，也可以在同一个页面的不同节点 render 多个应用，但他们本质上会共享 domain，因为 store 只会初始化一次，如果要销毁或重置状态，**@tacky/store** 会提供对应的 API

### middleware
```typescript
type Param = {
  dispatch: (action: DispatchedAction) => DispatchedAction,
  getState: (name?: string) => ModuleState | State
}
type middleware = (param: Param) => (next) => (action: DispatchedAction) => (action: DispatchedAction) => DispatchedAction
type use = (middleware: middleware | middleware[]) => void
```
**@tacky/store** 内置了 effect 和 logger 中间件，effect 默认开启，logger 默认关闭，effect 中间件上面已经介绍过了，而 logger 是用来打日志的，可以看到变化前后的 state 值，你还可以提供自定义的中间件来触达 action 的执行过程，中间件的写法保留了 **redux** 中间件的写法，你可以像下面这样使用 use 方法添加中间件：
```js
const middleware = ({ dispatch, getState }) => (next) => (action) => {
  // balabala...
  const nextHandler = next(action)
  // peipeipei...
  return nextHandler
}

Tacky.use(middleware);
Tacky.use(otherMiddleware);

Tacky.render(<Layout />, '#app');
```

> use 函数的参数 middleware 可以是一个数组，一次性加载多个中间件，也可以 use 多次，效果和数组是一样的，中间件名称不能重复，否则会报错，注意载入中间件必须先于 Tacky.render 执行

### config
```typescript
type Config = {
  middleware: {
    logger: boolean = false,
    effect: boolean = true
  },
  devTool: boolean = false
}
type config = (config: Config) => void
```
config 函数用来定义全局配置信息，可以开启或关闭中间件、开发者工具（这个开发者工具并不是社区的 redux dev tool，只是 **@tacky/store** 预留的一些依赖 map，暂时没有可视化界面），传入的配置会覆盖默认配置，使用方式如下所示：
```js
import Tacky from '@tacky/store';

Tacky.config({
  middleware: {
    logger: true,
  }
});

Tacky.render(<Layout />, '#app');

// 下面是框架提供的默认值
let ctx = {
  middleware: {
    logger: false, // 默认关闭 logger 中间件，在生产环境自动关闭
    effect: true // 默认开启 effect 中间件
  },
  devTool: false // 默认关闭 devTool，在生产环境自动关闭
}
```

> 必须在 Tacky.render 之前调用

### exception
**@tacky/store** 默认在 stick 函数返回的高阶组件中加了 ErrorBoundary 组件来 catch 组件异常，防止整个应用全部崩溃。

## 最佳实践

### 架构图
![framework](https://qhstaticssl.kujiale.com/as/2232c5fc6a39cc05732ad9fd7a99703a/bp-framework.png)

### 目录结构设计
```
├── @domain // 领域模型层，不可以互相调用，只关注当前领域模型的操作和职责
│   ├── column.js
│   └── tag.js
├── @api // api 防腐层
│   └── index.js
├── @components // 展示型纯组件或自己维护状态的组件
│   └── design-column
│       ├── index.jsx
│       └── index.scss
└── @blocks // 区块组件，包含状态管理业务逻辑的业务组件
    └── live-list
        ├── index.jsx
        └── index.scss

├── @presenter // 处理呈现层，可以向上组合、调用 domain 层，一般是和视图一一对应的关系，描述每个模块容器组件触发的行为过程以及一些处理
│   └── list.js
│   └── head.js
├── modules // 模块
│   └── list // 列表模块
│   │   ├── index.jsx
│   │   └── index.scss
│   └── head // 头部模块
│       ├── index.jsx
│       └── index.scss
├── Layout.jsx // 最外层的根布局组件，组装各种模块拼合页面
├── README.md
├── entry.js // 入口文件，挂载 Layout 到 dom 上以及做一些初始化操作
├── layout.scss
├── page.json
└── tpl.pug
```

### 如何设计 Presenter（处理呈现层）
view 层中尽可能只定义事件行为，不要做过多业务逻辑，尽可能丢到处理呈现层来进行，如下代码所示是 list 模块的 presenter：
```js
import $column from '@domain/dwork/design-column/column';
import $list from '@presenter/dwork/column-list/list';
// 在视图中只定义行为，一目了然
@stick()
export default class List extends React.PureComponent {
  componentDidMount() {
    $list.initLayoutState();
  }

  render() {
    return (
      <>
        <Radio.Group onChange={(id) => $list.changeTag(id)}></Radio.Group>
        <Pagination
          current={$column.current}
          defaultPageSize={$column.pageSize}
          totalPage={$column.totalPage}
          onChange={(page) => $list.changePage(page)}
          hideOnSinglePage
        />
      </>
    );
  }
}

// 在 presenter 中实现好这个行为的流程和业务逻辑
import { getQuery, updateQuery } from '@util/url-tool';
import $column from '@domain/dwork/design-column/column';
import $tag from '@domain/dwork/design-column/tag';

export default class ListPresenter {
  async changePage(page) {
    $column.updateColumnListPage(page);
    updateQuery({
      page,
    });
    $column.fetchColumnListFromRemote({
      page,
      tagId: $tag.currentTagId
    });
  }

  async changeTag(id) {
    $column.updateColumnListPage(1);
    $tag.updateCurrentTagId(id);
    updateQuery({
      page: 1,
      tagid: id
    });
    $column.fetchColumnListFromRemote({
      page: 1,
      tagId: id
    });
  }

  async initLayoutState() {
    const { page = 1, tagid = '' } = getQuery();
    $column.updateColumnListPage(page);
    $tag.updateCurrentTagId(tagid);
    $tag.fetchTagsFromRemote();
    $column.fetchColumnListFromRemote({ page, tagId: tagid });
  }
}
```

还可以做一些异步任务的流程控制，将来还会加入 operator
```js
export default class Presenter {
  async initLayoutStateRace() {
    const { page = 1, tagid = '' } = getQuery();
    this.$tag.updateCurrentTagId(tagid);
    // 此时 tagId 是更新后的值
    await Promise.race([
      this.$tag.fetchTagsFromRemote(),
      this.$column.fetchColumnListFromRemote({ page, tagId: tagid })
    ])
    // 此时上面更新过的 state 都是最新的
    this.$column.updateColumnListPage(page);
  }

  async initLayoutState() {
    const { page = 1, tagid = '' } = getQuery();
    this.$tag.updateCurrentTagId(tagid);
    await Promise.all([
      this.$tag.fetchTagsFromRemote(),
      this.$column.fetchColumnListFromRemote({ page, tagId: tagid })
    ])
    this.$column.updateColumnListPage(page);
  }

  async initLayoutStateSync() {
    const { page = 1, tagid = '' } = getQuery();
    this.$tag.updateCurrentTagId(tagid);
    this.$column.updateColumnListPage(page);
  }
}
```

### 如何设计 API 防腐层
这一层主要是和后端的数据结构隔离，让前端关注前端的数据结构，如果后端字段改了只需要在这一层调整，不需要一层一层改下去：
```js
import API from '@util/ajax-tool';

export async function fetchColumnList({ page, num, tagId }) {
  const { designColumnVos, totalPages } = await API.get('/api/list',
    { page, num, tagid: tagId });
  return {
    columnList: designColumnVos,
    totalPage: totalPages,
  };
}

export async function fetchCategoryTags() {
  const { c, d } = await API.get('/api/tag');
  if (c === '-1') {
    return {
      tags: [],
    };
  }
  // 或者修改一些数组中的字段值以满足组件需要的参数
  return {
    tags: d && d.l,
  };
}
```

### 如何初始化一个 Tacky 项目
仅仅调用 render 函数就可以，如下所示：
```js
// entry.js
import React from 'react';
import Tacky from '@tacky/store';
import Layout from './Layout';

async function main() {
  // 全局配置信息
  Tacky.config({
    middleware: {
      logger: true,
    }
  });
  // 载入中间件
  Tacky.use(middleware);
  // 渲染
  Tacky.render(<Layout />, '#app', async () => {
  });
}

main();
```

### 如何动态初始化 domain 的状态值
```js
import $column from '@domain/design-column'; // $column 是一个实例

async function main() {
  const obj = await API.getRemoteData();
  // 可以在渲染之前修改状态值
  $column.$update(obj);
  // 渲染
  Tacky.render(<Layout />, '#app', async () => {
  });
}

main();
```

### 如何懒加载 domain
在一些代码分割，动态异步懒加载资源的情况下，root 组件已经被渲染出来了，新的 domain 如何才能加载到 @tacky/store 的依赖树中？可以使用 $lazyLoad 方法，如下代码所示：
```js
// lazy-entry.js 这个文件是懒加载的
import $column from '@domain/design-column'; // $column 是一个实例

async function main() {
  // 懒加载当前实例到 @tacky/store 依赖树中
  $column.$lazyLoad();
}

main();
```

> 初次渲染时 Tacky.render 已经自动把实例化的 domain 加载进来了，不需要手动调用加载方法

### 如何重置、卸载 domain 的状态值
卸载 domain 如下代码所示：
```js
import $column from '@domain/design-column'; // $column 是一个实例

async function main() {
  // 卸载当前实例对应的 state tree
  $column.$destroy();
  // 渲染
  Tacky.render(<Layout />, '#app', async () => {
  });
}

main();
```

重置 domain 如下代码所示：
```js
import $column from '@domain/design-column'; // $column 是一个实例

async function main() {
  // 回到最初 domain class 里面声明的初始值，该操作也会触发视图重新渲染
  $column.$reset();
  // 渲染
  Tacky.render(<Layout />, '#app', async () => {
  });
}

main();
```

### 如何链接模型和组件
下面是一个简单的例子，详情请见上面的 API & 概念：
```js
import { stick } from '@tacky/store';
import $column from '@domain/dwork/design-column/column'; // 导出的是一个实例
import $list from '@presenter/dwork/column-list/list'; // 导出的是一个实例

@stick() // 标记需要自动同步状态
export default class List extends React.PureComponent {
  componentDidMount() {
    $list.initLayoutState();
  }

  render() {
    return (
      <>
        <Radio.Group onChange={(id) => $list.changeTag(id)}></Radio.Group>
        <Pagination
          current={$column.current}
          defaultPageSize={$column.pageSize}
          totalPage={$column.totalPage}
          onChange={(page) => $list.changePage(page)}
          hideOnSinglePage
        />
      </>
    );
  }
}
```

### 如何初始化 domain 更加灵活
建议在每个 page 的根目录都可以创建一个 initDomain.js 文件来实例化 domain，这样下层调用 domain 可以更加灵活，domain 也可以不是单例的了。
```js
import Column from '@domain/dwork/design-column/column-list';
import Tag from '@domain/dwork/design-column/tag';

const $column = new Column();
const $column2 = new Column();
const $tag = new Tag();

export {
  $column,
  $column2,
  $tag,
};
```
