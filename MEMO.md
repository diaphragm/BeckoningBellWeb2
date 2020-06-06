## TODO

- [ ] 見た目のブラッシュアップ
  - [ ] 鐘一覧
  - [ ] メッセージ
  - [ ] 色
  - [ ] divider
  - [ ] ツイッター埋め込み
  - [ ] スタンプリスト
  - [ ] 全体的な幅とか
  - [ ] 合言葉の導線を考える
  - [ ] ヘッダーがやっぱりいまいち
    - 折りたたみはしたい
    - 鐘の情報とかはまとめたい
- [ ] SVGの色調整
  - PNGにしたほうが手っ取り早いかもしれない
- [x] 更新の連打制限
  - twitterへの投稿だけ制限する
  - 頻繁に更新してもtwitterには反映されません的な注意書きいれる
  - [ ] コードベタ書きにしちゃったので設定にする
- [ ] SEO対策
- [x] Tweet機能
  - [x] 新しい鐘
  - [x] 更新時
  - [x] 終了時
- [ ] WebPush
  - [ ] 新しい鐘が鳴ったら(index)
  - [ ] 特定の鐘でメッセージ飛んできたら(bell/:id)
- [ ] OGP
  - [ ] imageは募集場所をばばーんと
  - [ ] titleは募集場所
  - [ ] descriptionに備考
  - [ ] 募集終了したらimageとdescriptionを終了に差し替え
    - [ ] 反映時間を調査
- [x] 環境ごとの設定をまとめる
- [ ] CI/CD

## 設定

### Twitter Token
```
firebase functions:config:set twitter.consumer_secret=XXXXX
firebase functions:config:set twitter.consumer_key=XXXXX
firebase functions:config:set twitter.access_token_key=XXXXX
firebase functions:config:set twitter.access_token_secret=XXXXX
```

### etc.
```
firebase functions:config:set app.base_url=https://enviroment/
```
