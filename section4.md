### CQRS

コマンド クエリ責務分離 (CQRS) パターンは、データ ストアの読み取り操作と更新操作を分離する。

サーバの機能を「コマンド」（副作用あり）と「クエリ」（副作用なし）で完全に分ける、という考え方

利点
スケーラブル(読み取り回数＞書き込み回数)

### Mediator パターン

クリーンアーキテクチャーの図に従うと、今回のプロジェクト全体は以下のように分類できる。

中心
Entities=Domain プロジェクト
UseCases=Application プロジェクト
Controllers(Presenters)=API プロジェクト
外側

ソフトウェアの外側の円が内側を参照することができる。
⇒ つまり、内側の円からは外側の円が何か全く知ることができない。

### 実装

Application プロジェクトに ASP.NET で独自に用意されている Mediatr のプロジェクトを参照する。

> Ctrl + Shift + P 　>　 Nuget と検索
> MediatR.Extensions.Microsoft.DependencyInjection を選択
