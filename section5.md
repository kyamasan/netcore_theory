### 強い型付けを行う方法

any は型付けを行わないので、activity.name と間違えても気づかない。

```js
{
  this.state.activities.map((activity: any) => (
    <List.Item key={activity.id}>{activity.title}</List.Item>
  ));
}
```

model フォルダの中に、activity.ts を用意する。

```ts
export interface IActivity {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  city: string;
  venue: string;
}
```

App.tsx

```tsx
interface IState {
  activities: IActivity[];
}

class App extends Component<{}, IState> {
  readonly state: IState = {
    activities: [],
  };
  componentDidMount() {
    axios
      .get<IActivity[]>('http://localhost:5000/api/activities')
      .then((response) => {
        this.setState({
          activities: response.data,
        });
      });
  }
}
```

### React hooks

クラスコンポーネントが無くなることで、this が使われなくなるのでソースが理解しやすくなる。

Effect Hooks
https://ja.reactjs.org/docs/hooks-effect.html
関数コンポーネント内で副作用を実行することができる。
https://qiita.com/Mitsuw0/items/801f783ca74b062c1ed8

以下２つの関数による処理のことを「副作用」と呼ぶ。

1. 引数以外の要因で結果が変わってしまう関数
2. 関数の外に影響を与えてしまう関数

```js
import React, { Component } from 'react';
↓
import React, { useState } from 'react';
```

useState は型指定しないと never 型になるので、以下のように型を付ける。

```js
const [activities, setActivities] = useState<IActivity[]>([]);
```

### rafce

便利なスニペット

```js
import React from 'react';

const NavBar = () => {
  return <div></div>;
};

export default NavBar;
```

### Grid(Semantic UI React)

https://react.semantic-ui.com/collections/grid/

semantic ui では 12 ではなく 16 グリッド。

### TypeScript

tsx では props の型を指定することができる。

https://qiita.com/sangotaro/items/3ea63110517a1b66745b

```js
interface IProps {
  activities: IActivity[];
}

const ActivityList: React.FC<IProps> = ({ activities }) => {};
```

IActivity を typesript で指定すると、null を初期値にセットできないので、Union 型で対応する。

```js
const [selectedActivity, seiSelecredActivity] = useState<IActivity>(null);
↓
const [selectedActivity, seiSelecredActivity] = useState<IActivity | null>(null);
```

props を渡さないことも可能。&&の左側が null でない場合にのみ props をセットする。

```js
{
  selectedActivity && <ActivityDetails activity={selectedActivity} />;
}
```

props を NULL 許可型にする方法(2 通り)

> !を付ける

```js
<ActivityDashboard
  selectedActivity={selectedActivity!}
/>
```

> NULL 許可の UNION 型を使用する

```js
interface IProps {
  selectedActivity: IActivity | null;
}
```

### React で Form を編集する方法

React は仮想 DOM を編集する為、直接 Form のような実体 DOM を編集することはできない。その為、それぞれの Form に OnChange イベントを用意することで、仮想 DOM の編集を可能にし、実体 DOM を書き換える。

```js
return (
  <Segment clearing>
    <Form>
      <Form.Input
        onChange={handleInputChange}
        placeholder="Title"
        value={activity.title}
      />
      <Form.TextArea
        row={2}
        placeholder="Description"
        value={activity.description}
      />
      <Form.Input placeholder="Category" value={activity.category} />
      <Form.Input type="date" placeholder="Date" value={activity.date} />
    </Form>
  </Segment>
);
```

onChange イベント

```js
const handleInputChange = (event: any) => {
  console.log(event.target.value);

  setActivity({ ...activity, title: event.target.value });
};
```

event.target ごとに処理を共通化できる。

```js
const handleInputChange = (event: any) => {
  const { name, value } = event.target;
  setActivity({ ...activity, [name]: value });
};

<Form.Input placeholder="Category" name="category" value={activity.category} />;
```

event: any の型チェックを厳密にできる。
この時、input の onChange イベントは React.ChangeEvent<HTMLInputElement>なのに対し、
TextArea の onChange イベントは React.FormEvent<HTMLTextAreaElement>と型が異なる。

FormEvent は ChangeEvent の代わりに使えるので、以下のように型チェックを実装できる。
また、FormEvent では event.target ではなく、event.currentTarget となる。

```js
const handleInputChange = (
  event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  const { name, value } = event.currentTarget;
  setActivity({ ...activity, [name]: value });
};
```

### UUID

クライアントサイドでユニークな guid を作る

> npm install @types/uuid

```js
import { v4 as uuid } from 'uuid';
```

### 特殊な prop、key について

通常と異なり、key は設定不要で使える。
key が変更されると component が再描画される。

これで、編集中に Create Activity ボタンを押したら、すぐにモードが切り替わる。

```js
<ActivityForm
  key={(selectedActivity && selectedActivity.id) || 0}
  setEditMode={setEditMode}
  activity={selectedActivity!}
  createActivity={createActivity}
  editActivity={editActivity}
/>
```
