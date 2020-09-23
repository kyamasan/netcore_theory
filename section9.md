### Error

Binding element 'activity' implicitly has an 'any' type.

```tsx
const ActivityListItem: = ({ activity }) => {
↓
const ActivityListItem: React.FC<{activity: IActivity}>  = ({ activity }) => {
```

### アクティビティをグループでまとめる

> Object.entry

https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/entries

引数に与えたオブジェクトが所有する、文字列をキーとした列挙可能なプロパティの組 [key, value] からなる配列を返す。

Returns an array of key/values of the enumerable properties of an object

> reduce

https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce

Array 型([])の各要素に対して、reducer 関数を実行し、単一の結果値にする。

> Object.entries()

https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/entries

引数に与えたオブジェクトが所有する、文字列をキーとした列挙可能なプロパティの組 [key, value] からなる配列を返す。

```ts
groupActivitiesByDate(activities: IActivity[]) {
  const sortedActivities = activities.sort(
    (a, b) => Date.parse(a.date) - Date.parse(b.date)
  );
  return Object.entries(
    sortedActivities.reduce((activities, activity) => {
      const date = activity.date.split('T')[0];
      activities[date] = activities[date]
        ? [...activities[date], activity]
        : [activity];
      return activities;
    }, {} as { [key: string]: IActivity[] })
  );
}
```

配列をオブジェクトに変換するというのが上記の処理。

```ts
sortedActivities.reduce((activities, activity) => {
  ...
  return activities;
}, {}
```

> arr.reduce(callback( accumulator, currentValue[, index[, array]] )[, initialValue])

{}の部分は initialValue

```ts
{} as { [key: string]: IActivity[] }
```

as を使って initialValue の型を{ [key: string]: IActivity[] }に変換。

activities の date は string 型なので、const で宣言した date の中身にも string 型が入ってくることを型安全で保障したい。
Element implicitly has an 'any' type because index expression is not of type 'number'.

### インポートを全て補完する方法

赤波線部分にフォーカスし、Ctrl+.を押す。そして、Add All Missing Import を選択する。
