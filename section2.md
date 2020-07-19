### Program.cs

Program.cs
アプリケーション開始時、最初に Program クラスの Main メソッドが実行される。

Main メソッドでは、CreateHostBuilder メソッド という 1 つの処理を行う。コマンドライン実行時に引数(args)を指定したら、それを渡すこともできる。

CreateHostBuilder メソッドは戻り値に プログラムの初期処理の抽象化を行う IHostBuilder 型(説明:A program initialization abstraction.)のインスタンスを返す。
また、内部では CreateDefaultBuilder と ConfigureWebHostDefaults の 2 つのメソッドを実行している。

ConfigureWebHostDefaults の中で、UseStartup メソッドが実行され、ここから Startup.cs に処理が移る。。

```cs
public class Program
{
    public static void Main(string[] args)
    {
        CreateHostBuilder(args).Build().Run();
    }

    public static IHostBuilder CreateHostBuilder(string[] args) =>
        Host.CreateDefaultBuilder(args)
            .ConfigureWebHostDefaults(webBuilder =>
            {
                webBuilder.UseStartup<Startup>();
            });
}
```

#### CreateDefaultBuilder

appsettings.json などの設定情報を反映させる役割等を担っている。

> The following defaults are applied to the returned Microsoft.Extensions.Hosting.HostBuilder:
> • set the Microsoft.Extensions.Hosting.IHostEnvironment.ContentRootPath to the result of System.IO.Directory.GetCurrentDirectory
> • load host Microsoft.Extensions.Configuration.IConfiguration from "DOTNET\_" prefixed environment variables
> • load host Microsoft.Extensions.Configuration.IConfiguration from supplied command line args
> • load app Microsoft.Extensions.Configuration.IConfiguration from 'appsettings.json' and 'appsettings.[Microsoft.Extensions.Hosting.IHostEnvironment.EnvironmentName].json'
> • load app Microsoft.Extensions.Configuration.IConfiguration from User Secrets when Microsoft.Extensions.Hosting.IHostEnvironment.EnvironmentName is 'Development' using the entry assembly
> • load app Microsoft.Extensions.Configuration.IConfiguration from environment variables
> • load app Microsoft.Extensions.Configuration.IConfiguration from supplied command line args
> • configure the Microsoft.Extensions.Logging.ILoggerFactory to log to the console, debug, and event source output
> • enables scope validation on the dependency injection container when Microsoft.Extensions.Hosting.IHostEnvironment.EnvironmentName is 'Development'

> 次のデフォルトが、返される Microsoft.Extensions.Hosting.HostBuilder に適用されます。
> •Microsoft.Extensions.Hosting.IHostEnvironment.ContentRootPath を System.IO.Directory.GetCurrentDirectory の結果に設定します
> •ホストの Microsoft.Extensions.Configuration.IConfiguration を "DOTNET\_"接頭辞付きの環境変数からロードします
> •提供されたコマンドライン引数からホスト Microsoft.Extensions.Configuration.IConfiguration を読み込みます
> • 'appsettings.json'および 'appsettings。[Microsoft.Extensions.Hosting.IHostEnvironment.EnvironmentName] .json'からアプリ Microsoft.Extensions.Configuration.IConfiguration を読み込みます。
> •Microsoft.Extensions.Hosting.IHostEnvironment.EnvironmentName がエントリアセンブリを使用して「開発」である場合、ユーザーシークレットからアプリ Microsoft.Extensions.Configuration.IConfiguration を読み込みます。
> •環境変数からアプリ Microsoft.Extensions.Configuration.IConfiguration を読み込む
> •提供されたコマンドライン引数からアプリ Microsoft.Extensions.Configuration.IConfiguration を読み込みます
> •コンソール、デバッグ、およびイベントソースの出力にログを記録するように Microsoft.Extensions.Logging.ILoggerFactory を構成する
> •Microsoft.Extensions.Hosting.IHostEnvironment.EnvironmentName が 'Development'の場合、依存関係注入コンテナーのスコープ検証を有効にします

#### ConfigureWebHostDefaults

Kestrel を Web サーバーとして使用する役割等を担っている。
Kestrel について
https://docs.microsoft.com/ja-jp/aspnet/core/fundamentals/servers/?view=aspnetcore-3.1&tabs=windows#kestrel

> The following defaults are applied to the Microsoft.AspNetCore.Hosting.IWebHostBuilder: use Kestrel as the web server and configure it using the application's configuration providers, adds the HostFiltering middleware, adds the ForwardedHeaders middleware if ASPNETCORE_FORWARDEDHEADERS_ENABLED=true, and enable IIS integration.

> 次のデフォルトが Microsoft.AspNetCore.Hosting.IWebHostBuilder に適用されます。Kestrel を Web サーバーとして使用し、アプリケーションの構成プロバイダーを使用して構成し、HostFiltering ミドルウェアを追加し、ASPNETCORE_FORWARDEDHEADERS_ENABLED = true の場合は ForwardedHeaders ミドルウェアを追加し、IIS 統合を有効にします。

### Startup.cs

Startup のコンストラクタ内部にアプリケーションの様々な設定を書くことができる。
初期では appsettings.json と appsettings.Development.json の 2 つが設定ファイルとして存在する。appsettings.json は常に読み込みが行われる一方で、appsettings.Development.json は開発時にしか読み込みが行われない。
その為、開発時には appsettings.Development.json の設定が優先される。

```cs
public class Startup
{
    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }
}
```

ConfigureServices は DI コンテナであり、アプリケーションの他の部分で使用したいサービスは全てここに登録する必要がある。
初期では、AddControllers というサービスのみが登録されている状態。

```cs
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
}
```

Configure は HTTP リクエストのパイプラインの設定を行う為に実行する。リクエストパイプラインに対して、ここに書かれた処理順序でミドルウェアへの設定追加ができる。

UseDeveloperExceptionPage
開発モードの時は、詳細なエラーページを参照することができるようにする。

UseHttpsRedirection
HTTP プロトコルを介して受け取ったリクエストを全て HTTPS にリダイレクトする。

UseRouting
リクエストを受け取った時に、ルーティングを使用するようにアプリケーションに指示する。このミドルウェアのおかげで、API が受け取ったリクエストを適切なコントローラにルーティングできるようになる。

UseAuthorization
認証に使用するミドルウェア。使用したからといって認証が必要になるわけではない。

UseEndpoints
API サーバがリクエストを受けた時の為に、API とコントローラを結びつける(Map)エンドポイントを作成する。

```cs
public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
{
    if (env.IsDevelopment())
    {
        app.UseDeveloperExceptionPage();
    }

    //開発時はオフにして問題ない。
    // app.UseHttpsRedirection();

    app.UseRouting();

    app.UseAuthorization();

    app.UseEndpoints(endpoints =>
    {
        endpoints.MapControllers();
    });
}
```

Properties>launchSettings.json では、applicationUrl で HTTPS のリクエストを受け付けないように設定することができる。
開発中は HTTP のみリクエストを受け取ることが可能。

```json
"API": {
  "commandName": "Project",
  "launchBrowser": true,
  "launchUrl": "weatherforecast",
  "applicationUrl": "http://localhost:5000",
  // "applicationUrl": "https://localhost:5001;http://localhost:5000",
  "environmentVariables": {
    "ASPNETCORE_ENVIRONMENT": "Development"
  }
}

```

### Controller

Controller は必ず[Route("api/[controller]")]を必要とする。[controller]の部分はプレースホルダーで、ValuesController から Controller を抜いた文字列を指す。(今回は Values となる。)

```cs
[Route("api/[controller]")]
[ApiController]
public class ValuesController : ControllerBase
{
    // GET api/values
    [HttpGet]
    public ActionResult<IEnumerable<string>> Get()
    {
        return new string[] { "value1", "value2" };
    }

    // GET api/values/5
    [HttpGet("{id}")]
    public ActionResult<string> Get(int id)
    {
        return "value";
    }

    // POST api/values
    [HttpPost]
    public void Post([FromBody] string value)
    {
    }

    // PUT api/values/5
    [HttpPut("{id}")]
    public void Put(int id, [FromBody] string value)
    {
    }

    // DELETE api/values/5
    [HttpDelete("{id}")]
    public void Delete(int id)
    {
    }
}
```

ターミナルから Web サーバを起動するには、以下のコマンドを実行する。

> dotnet run -p API/

### Domain Entity

```cs
namespace Domain
{
  public class Value
  {
    public int Id { get; set; }
    public string Name { get; set; }
  }
}
```

### DbContext

データベースへの検索、更新、登録、削除といった基本的な操作は、DbContext クラスを使用して行うことができる。

使用には Entity Framework のインストールが必要。

> Ctrl + Shift + P 　>　 Nuget と検索
> Microsoft.EntityFrameworkCore、Microsoft.EntityFrameworkCore.Sqlite を選択
> dotnet --version で確認できるバージョンと同じものをインストール

```cs
namespace Persistence
{
  public class DataContext : DbContext
  {
  }
}
```

DbContext
A DbContext instance represents a session with the database and can be used to query and save instances of your entities. DbContext is a combination of the Unit Of Work and Repository patterns.

DbContext のインスタンスは、DB セッションを表し、クエリの実行や、エンティティのインスタンスを管理する、とある。
その為、DbContext に適切なコンストラクタを設定する必要がある。

引数には DbContextOptions を指定し、継承元の DbContext にも引数を渡す。(継承元に引数を渡さない場合、Migration の作成で問題が発生する。)

また、ドメインクラスの Value クラスにアクセスする為の Values というプロパティを用意する。

```cs
using Domain;

public class DataContext : DbContext
{
  public DataContext(DbContextOptions options) : base(options)
  {

  }

  public DbSet<Value> Values { get; set; }
}
```

これで、DataContext クラスを DI することで、様々な箇所で Values に対して変更を加えることができるようになる。
接続文字列の取得には、Configuration.GetConnectionString()を使用する。これで、appsettings.json 内の"ConnectionStrings"の情報が取得できる。

```cs
using Persistence;

public void ConfigureServices(IServiceCollection services)
{
  services.AddDbContext<DataContext>(opt =>
  {
    opt.UseSqlite(Configuration.GetConnectionString("DefalutConnection"));
  });
  services.AddControllers();
}
```

appsettings.json で接続文字列の情報を保持しておくことができる。
Sqlite では DB 名を指定するだけでよい。

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data source=reactivities.db"
  }
}
```

### Dotnet-ef

https://docs.microsoft.com/ja-jp/ef/core/miscellaneous/cli/dotnet

Entity Framework Core 用のコマンドラインインターフェイス (CLI) ツール

> dotnet tool install --global dotnet-ef

-p には、ターゲットプロジェクトを指定する。(DataContext を含む Persistence を指定)
-s には、スタートアッププロジェクトを指定する。

この時、スタートアッププロジェクトは Microsoft.EntityFrameworkCore.Design をインストールしておく必要がある。

> dotnet ef migrations add InitialCreate -p Persistence/ -s API/

この時、以下のようなエラーが出た時は DbContext に option が渡せていない可能性がある。

> No database provider has been configured for this DbContext. A provider can be configured by overriding the DbContext.OnConfiguring method or by using AddDbContext on the application service provider. If AddDbContext is used, then also ensure that your DbContext type accepts a DbContextOptions<TContext> object in its constructor and passes it to the base constructor for DbContext.

```cs
public DataContext(DbContextOptions options) : base(options)
{

}
```

成功すれば Persistence 直下に Migrations フォルダが作成されるはず。
作成された cs ファイルには Up()と Down()が存在する。
DbSet に指定した名前と同じものが name に入っているはず。

> name: "Values",

### データベースの作成

※dotnet ef -h、dotnet ef database -h で都度コマンドは確認できる。

> dotnet ef database

### アプリケーション実行時に MIgration を実行する

```cs
public static void Main(string[] args)
{
  // CreateHostBuilder(args).Build().Run();
  public static void Main(string[] args)
  {
    var host = CreateHostBuilder(args).Build();

    using (var scope = host.Services.CreateScope())
    {
      var services = scope.ServiceProvider;
      try
      {
        var context = services.GetRequiredService<DataContext>();
        context.Database.Migrate();
      }
      catch (Exception ex)
      {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred during migration");
      }
    }
    host.Run();
  }
}
```

startup プロジェクトが存在する階層で dotnet watch run を実行する。

> cd API
> dotnet watch run

Ctrl + Shift + P > Sqlite Open Database > reactivities.db を選択すると、SQLITE EXPLORER が表示される。
EFMigrationsHistory を右クリックして SHOW TABLE を選択すると、履歴情報が確認できる。

### データの追加方法
