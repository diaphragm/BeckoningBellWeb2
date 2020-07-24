## TODO

- [ ] 見た目のブラッシュアップ
  - [x] 鐘一覧
  - [x] メッセージ
  - [x] 色
  - [x] divider
  - [x] ツイッター埋め込み
  - [ ] スタンプリスト
  - [x] 全体的な幅とか
  - [ ] 合言葉の導線を考える
  - [x] ヘッダーがやっぱりいまいち
    - 折りたたみはしたい
    - 鐘の情報とかはまとめたい
- [x] SVGの色調整
  - PNGにしたほうが手っ取り早いかもしれない
- [x] 更新の連打制限
  - twitterへの投稿だけ制限する
  - 頻繁に更新してもtwitterには反映されません的な注意書きいれる
  - [x] コードベタ書きにしちゃったので設定にする
- [x] 古い鐘のメンテ
- [x] SEO対策
- [x] Tweet機能
  - [x] 新しい鐘
  - [x] 更新時
  - [x] 終了時
  - [x] truncate
- [x] WebPush
  - [x] 新しい鐘が鳴ったら(index)
  - [x] 特定の鐘でメッセージ飛んできたら(bell/:id)
  - [x] 画面にON/OFFボタンを付ける
  - [x] 通知のタイムラグを何とかする。1分以上は破棄とかする
- [x] OGP
  - [x] imageは募集場所をばばーんと
  - [x] titleは募集場所
  - [x] descriptionに備考
  - [x] 募集終了したらimageとdescriptionを終了に差し替え
    - [ ] 反映時間を調査
- [x] 環境ごとの設定をまとめる
- [ ] CI/CD
- [ ] bundleされたjsが2.4MBとかあるので調査
- [x] 文字数制限などバリデーターちゃんとする
- [x] BAN機能
  - [x] ホストが指定した狩人は非表示
  - [ ] アク禁機能
    - [ ] DB直接弄ったりしてお手軽に実装したい
- [ ] VueもTypeScript化
- [x] Google Fonts使うと重くなるのどうにかする
  - Androidだと明朝体入ってなくてダサい
  - headerでlinkで読み込んだら何故か解決した
- [ ] Vue Composition API使う
  - [ ] Vue 3にする


## 設定

### Twitter Token
```
firebase functions:config:set twitter.consumer_secret=XXXXX
firebase functions:config:set twitter.consumer_key=XXXXX
firebase functions:config:set twitter.access_token_key=XXXXX
firebase functions:config:set twitter.access_token_secret=XXXXX
```

### env
```
firebase functions:config:set app.env=(staging|production)
```
