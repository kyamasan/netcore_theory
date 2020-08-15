### MobX

> npm install mobx mobx-react-lite

mobx には mutate など redux では実現できない機能が存在する。

```js
import { observable } from 'mobx';
import { createContext } from 'react';

class ActivityStore {
  @observable title = 'Hello from mobx';
}

export default createContext(new ActivityStore());
```

```js
import ActivityStore from '../stores/activityStore';

const App = () => {
  const activityStore = useContext(ActivityStore);
  ...
}
```

mobx では redux とは異なり@action 内で state(loadingInitial)を直接書き換えることができる。redux では set~を通してしか変更できない。

```js
class ActivityStore {
  @observable activities: IActivity[] = []];
  @observable loadingInitial = false;

  @action loadActivities = () => {
    this.loadingInitial = true;
  }
}
```

mobx で変更した state の変更を受け取るには、observer でラップする必要がある。

```js
export default observer(ActivityDetails);
```

### async await

then を使ったチェーン構文

```js
@action loadActivities = () => {
  this.loadingInitial = true;
  agent.Activities.list()
    .then((activities) => {
      activities.forEach((activity) => {
        activity.date = activity.date.split('.')[0];
        this.activities.push(activity);
      });
    })
    .catch((error) => console.log(error))
    .finally(() => (this.loadingInitial = false));
};
```

try~catch 構文を組み合わせて、async~await を使って書き換えることができる。

```js
@action loadActivities = async () => {
  try {
    const activities = await agent.Activities.list();
    activities.forEach((activity) => {
      activity.date = activity.date.split('.')[0];
      this.activities.push(activity);
    });
    this.loadingInitial = false;
  } catch (error) {
    console.log(error);
    this.loadingInitial = false;
  }
};
```

チェーン構文では void しか返さないのに対して、async メソッドは常に Promise を返す。
動き自体は全く同じ。

> (property) ActivityStore.loadActivities: () => void

> (property) ActivityStore.loadActivities: () => Promise<void>

### computed

mobx 機能の一つ。クライアント側で List の順序を入れ替えたい時に使用する。

```js
import { observable, action, computed } from 'mobx';

@computed get activitiesByDate() {
  return this.activities.sort(
    (a, b) => Date.parse(a.date) - Date.parse(b.date)
  );
}
```

### observable map

https://mobx.js.org/refguide/map.html#observable-maps

### onClick

引数がなければアロー関数を使わない書き方も可能。

https://ja.reactjs.org/docs/faq-functions.html#why-is-my-function-being-called-every-time-the-component-renders

https://ja.reactjs.org/docs/faq-functions.html#how-do-i-pass-a-parameter-to-an-event-handler-or-callback

```js
<Button
  onClick={() => openEditForm(activity!.id)}
/>
<Button
  onClick={cancelSelectedActivity}
/>
```

### Strict モード

```js
import { observable, action, computed, configure } from 'mobx';

configure({ enforceActions: 'always' });
```

enforceActions: 'always'を設定すると、@action 以外の場所で state を変更できなくなる。

configure({ enforceActions: "always" })を設定している場合に、@action の中で非同期処理を実行すると、Store の変数を変更してしまうとエラーが発生する。
非同期処理は@action をつけていないメソッドの方に切り出すか、runInAction を使うことで、エラーを回避することが可能。

```js
@action loadActivities = async () => {
  try {
    const activities = await agent.Activities.list();
    runInAction(() => {
      activities.forEach((activity) => {
        activity.date = activity.date.split('.')[0];
        this.activityRegistry.set(activity.id, activity);
      });
      this.loadingInitial = false;
    });
  } catch (error) {
    runInAction(() => {
      this.loadingInitial = false;
    });
    console.log(error);
  }
};
```

runInAction は名前を設定できる。

```js
runInAction('loading activities error', () => {
```
