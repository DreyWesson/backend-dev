const Clock = class {
    constructor({ template }) {
      this.timer = undefined;
      this.template = template;
    }
    formatTime = (time) => {
      return time < 10 ? `0${time}` : time;
    };
    render = () => {
      let date = new Date();
      let hours = this.formatTime(date.getHours());
      let mins = this.formatTime(date.getMinutes());
      let secs = this.formatTime(date.getSeconds());
  
      let output = this.template
        .replace("h", hours)
        .replace("m", mins)
        .replace("s", secs);
  
      console.log(output);
    };
  
    stop = () => clearInterval(this.timer);
  
    start = () => {
      this.render();
      this.timer = setInterval(this.render, 1000);
    };
  };
  
  let clock = new Clock({ template: "h:m:s" });
  clock.start();
  