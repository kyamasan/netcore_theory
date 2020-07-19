### 環境準備

.Net Core の開発には SDK が必要。

> https://dotnet.microsoft.com/download/dotnet-core

インストールされている SDK のバージョンは、コマンドラインで確認可能

> dotnet --info

使用する SDK(デフォルトでは最新の SDK)の確認方法

> dotnet --version

### 拡張機能

Auto Close Tag
https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-close-tag

Auto Rename Tag
https://marketplace.visualstudio.com/items?itemName=formulahendry.auto-rename-tag

Bracket Pair Colorizer
https://marketplace.visualstudio.com/items?itemName=CoenraadS.bracket-pair-colorizer

C# Extensions
https://marketplace.visualstudio.com/items?itemName=kreativ-software.csharpextensions

Material Icon Theme(vscode の歯車をクリックすれば、File Icon Theme を選択できる。)
https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme

NuGet Package Manager
https://marketplace.visualstudio.com/items?itemName=jmrog.vscode-nuget-package-manager

Prettier - Code formatter
https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode

SQLite
https://marketplace.visualstudio.com/items?itemName=alexcvzz.vscode-sqlite

### Dotnet CLI を利用したプロジェクトの作成

コマンドラインから作成を行うことができる。

作成できるプロジェクトの一覧を確認

> dotnet new -h

ソリューションの作成

> dotnet new sln

プロジェクトの作成

Persistence データベースのクエリとビジネスロジックを管理

> dotnet new classlib -n Domain
> dotnet new classlib -n Application
> dotnet new classlib -n Persistence

WebAPI の作成

> dotnet new webapi -n API

ソリューションとプロジェクトの紐づけ

> dotnet sln add Domain/
> dotnet sln add Application/
> dotnet sln add Persistence/
> dotnet sln add API/

確認

> dotnet sln list

### プロジェクトの依存関係

domain がアプリケーションの中心にあり、domain は他のどのプロジェクトにも依存しない。

Application は domain、Persistence の両方に依存する。

> cd Application
> dotnet add reference ../Domain
> dotnet add reference ../Persistence

API は Application に依存する。

> cd ../API
> dotnet add reference ../Application

Persistence は domain に依存する。(Domain には Persistence が使用するエンティティ(オブジェクトのデータ構造)が含まれる為)

> cd ../Persistence
> dotnet add reference ../Domain

### VsCode

ソリューションのあるフォルダ上で、vscode を起動する。

> ../
> code .

以下のようなメッセージが右下に出るので、yes を選択すると、.vscode フォルダが作成され、launch.json、tasks.json が作成される。

> Required assets to build and debug are missing from 'netcore_theory'. Add them?

### ソリューション構成について深堀り

Persistence.csproj の中身について

> <Project Sdk="Microsoft.NET.Sdk">

"Microsoft.NET.Sdk"への参照が含まれている。

> <ProjectReference Include="..\Domain\Domain.csproj" /

他プロジェクトへの参照もここで確認できる。

> <TargetFramework>netstandard2.0</TargetFramework>

現状、netstandard2.0 をターゲットフレームワークとしている。
今後、他のパッケージ(エンティティフレームワークなど)を追加していくにつれて、このターゲットの値も更新していく必要がある。
マイクロソフトは、最大の互換性を担保する為に、最も低いバージョンからプロジェクトを作成することを推奨している。

例えば、netstandard2.0 をターゲットにして作成されたプログラムは.NET Framework、.NET Core、Xamarin のプロジェクト全てで使用できるが、netstandard2.0 から netcore3.1 にバージョンアップすると、.NET Core のプロジェクトでしか使用できなくなる。
https://www.fenet.jp/dotnet/column/environment/1850/#NET_Standard

```csproj
<Project Sdk="Microsoft.NET.Sdk">

  <ItemGroup>
    <ProjectReference Include="..\Domain\Domain.csproj" />
  </ItemGroup>

  <PropertyGroup>
    <TargetFramework>netstandard2.0</TargetFramework>
  </PropertyGroup>

</Project>
```

bin と obj フォルダを見た目から削除するには、vscode の File タブ>Preferences>Settings の画面を開く。
キーワード検索で exclude と入力し、Files:Exclude に以下のパターンを追加すれば OK。

> **/bin
> **/obj
