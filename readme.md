# 音の到来方向とその音にラベルを付けるためのWebアプリ（鳥の鳴き声を想定）

デモ：http://small-island.work/anno_bird/

requirements
----------------
```
apt-get install ruby
apt-get install gem
```

```
gem install sinatra
gem install haml
gem install wav-file
```

アノテーションサーバの起動
----------------

```
sh server_up.sh
```

起動後は、例えばブラウザから以下のようなアドレスにアクセス
```
http://localhost:4567/
```

ラベルファイル形式
----------------
１行あたり１ラベル（１区間）のコンマ区切りcsv
一行のフォーマットは以下の順序

```内部セグメントID,ラベル,時刻,方向,分離時セグメントID,教師ラベル=1```

注意事項
- 各行は入力順
- x座標の単位は(sec)
- y座標は0-1で正規化


新規プロジェクトの作成
----------------
requirements
=======

```
sox
soxi
hark
python3
```

実行ステップ
=======
1. audio/に元ファイルを入れる
2. config.shを書きかえる
3. `./create_project.sh`を実行
3. `./init_hark.sh`を実行

プロジェクトごとに最低限書き換える必要のある項目は以下
- プロジェクトの作業ディレクトリ名
```
work=$base/testtest
```
- プロジェクト名
```
project=testtest
```
- 対象の音ファイル
```
target="audio/test_rectf00.wav"
```
