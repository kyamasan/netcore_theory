### React Router

https://reactrouter.com/web/guides/quick-start

> npm install react-router-dom
> npm install @types/react-router-dom

index.tsx で以下のように記述する。

```js
import { BrowserRouter } from 'react-router-dom';

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);
```

App.tsx で以下のように記述する。

```js
<Container style={{ marginTop: '7em' }}>
  <Route exact path="/" component={HomePage} />
  <Route path="/activities" component={ActivityDashboard} />
  <Route path="/createActivity" component={ActivityForm} />
</Container>
```

Navbar.tsx で以下のように as={NavLink} to="/"のような情報を記述する。
Link ではなく NavLink を使用することでハイライト効果が付与される。
https://reactrouter.com/web/api/NavLink

```js
import { NavLink } from 'react-router-dom';

<Menu.Item as={NavLink} exact to="/">
  <img
    src="/assets/logo.png"
    alt="logo"
    style={{ marginRight: '10px' }}
  />
  Reactivities
</Menu.Item>
<Menu.Item name="Activities" as={NavLink} to="/activities" />
<Menu.Item>
  <Button
    as={NavLink}
    to="/createActivity"
    onClick={activityStore.openCreateForm}
    positive
    content="Create Activity"
  ></Button>
</Menu.Item>
```

RouteComponentProps に id がない為、エラーになる。

```tsx
const ActivityDetails: React.FC<RouteComponentProps> = ({ match }) => {
  const activityStore = useContext(ActivityStore);
  const {
    activity: activity,
    openEditForm,
    cancelSelectedActivity,
    loadActivity,
  } = activityStore;

  useEffect(() => {
    //Error: Property 'id' does not exist on type '{}'.
    loadActivity(match.params.id);
  });
};
```

Interface を追加し、id を受け取れるようにする。

```tsx
interface DetailParams {
  id: string;
}

const ActivityDetails: React.FC<RouteComponentProps<DetailParams>> = ({
  match,
}) => {
  const activityStore = useContext(ActivityStore);
  const {
    activity: activity,
    openEditForm,
    cancelSelectedActivity,
    loadActivity,
  } = activityStore;

  useEffect(() => {
    loadActivity(match.params.id);
  });
};
```

キャンセルボタンを実装するには、RouteComponentProps の、history.goBack(),もしくは history.push("")をキャンセルボタンに割り付ければよい。
goBack は外部サイトに戻る場合もあるので、push の方が良い。

```tsx
export interface RouteComponentProps<
  Params extends { [K in keyof Params]?: string } = {},
  C extends StaticContext = StaticContext,
  S = H.LocationState
> {
  history: H.History<S>;
  location: H.Location<S>;
  match: match<Params>;
  staticContext?: C;
}

<Button
  onClick={() => history.push('/activities')}
  basic
  color="grey"
  content="Cancel"
/>;
```

### Error Case

undefined 許容型を渡すには、まず変数 && と書く。

```tsx
loadActivity(match.params.id).then(() => {
  //Error: Argument of type 'IActivity | undefined' is not assignable to parameter of type 'SetStateAction<IActivity>'.Type 'undefined' is not assignable to type 'SetStateAction<IActivity>'.
  setActivity(initialFormState)
});
↓
loadActivity(match.params.id).then(() => {
  initialFormState && setActivity(initialFormState)
});
```

### useEffect と副作用

useEffect メソッドでは、アンマウント時にコンポーネントをクリーンアップできる。

useEffect() は、componentDidMount()、componentDidUpdate()、componentWillUnmount()をまとめたようなもの。

クリーンアップが必要な副作用
https://reactjs.org/docs/hooks-effect.html#effects-without-cleanup

```tsx
useEffect(() => {
  if (match.params.id) {
    loadActivity(match.params.id).then(() => {
      initialFormState && setActivity(initialFormState);
    });
  }
  //クリーンアップ用の関数を返す
  return () => {
    clearActivity();
  };
}, [loadActivity, match.params.id, clearActivity, initialFormState]);
```

クリーンアップが不要な副作用
https://ja.reactjs.org/docs/hooks-effect.html#effects-without-cleanup

### Prop の変更により再レンダリングを行う

componentWillReceiveProps()は非推奨

> this.props と nextProps を比較し、このメソッドで this.setState() を使用して状態遷移を実行できます。

https://ja.reactjs.org/docs/react-component.html#unsafe_componentwillreceiveprops

対処法 1.コンポーネントから state を一掃する。(今回は使えない)

https://ja.reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-controlled-component

対処法 2.location.key を用いた削除

コンポーネントに location.key を渡すことで、完全にコンポーネントのレンダリングをコントロールできる。
(キーの変更が反応すると、新しいコンポーネントのインスタンスが作成され、更新されます。)

https://ja.reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#recommendation-fully-uncontrolled-component-with-a-key

### Asp.tsx で location.key を取得する方法

```tsx
return (
  <>
    <NavBar />
    <Container style={{ marginTop: '7em' }}>
      ...
      <Route
        //Error: Property 'key' does not exist on type 'Location'.
        key={location.key}
        path={['/createActivity', '/manage/:id']}
        component={ActivityForm}
      />
    </Container>
  </>
);
```

App コンポーネントを withRouter でラップすることで取得可能。

```tsx
import { Route, withRouter } from 'react-router-dom';

const App: React.FC<RouteComponentProps> = ({ location }) => {
  return (
    <>
      <NavBar />
      <Container style={{ marginTop: '7em' }}>
        ...
        <Route
          key={location.key}
          path={['/createActivity', '/manage/:id']}
          component={ActivityForm}
        />
      </Container>
    </>
  );
};
export default withRouter(observer(App));
```

### よくあるエラーへの対処法

index.js:1 Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.

アンマウントされたコンポーネントに対して、更新をかけようとしていることによるエラー。
つまり、UseEffect が行われている。
副作用の条件付けが甘いので、アンマウントされたコンポーネントに更新がかからないように条件を見直すべき。

### scroll-restoration

https://reactrouter.com/web/guides/scroll-restoration
