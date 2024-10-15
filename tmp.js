class Article {
  constructor(title, date) {
    this.title = title;
    this.date = date;
  }

  static createTodays() {
    return new Article("Today's digest", new Date());
  }
}

let article = Article.createTodays();

console.log( article.title );