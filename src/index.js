import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';
import axios from 'axios';
//to do:
//remember where the scroll was and set the window to it

let client ="Client-ID f5da5fcbc80e3ab";
// var link='https://api.imgur.com/3/gallery/hot/viral/day/1?showViral=true&mature=false&album_previews=true';

var modal = document.getElementById('modal-container');
var root = document.getElementById('root');
var leftBtn=document.getElementById('left-btn-p');
var rightBtn =document.getElementById('right-btn-p');
var closeBtn =document.getElementById('closeBtn');
var modalImg = document.getElementById("modal-img");
let header = document.getElementById("header");

let imgPlaced=false;
let curImg = 0;
let imgsOnPage=0;
closeBtn.addEventListener('click', CloseModal);
// leftBtn.addEventListener('click',ChangeLeft);
// rightBtn.addEventListener('click',ChangeRight);

function CloseModal(){
  modal.style.display='none';
  root.style.display='block';
  document.getElementById(curImg+"-img").scrollIntoView();
}
function GetRandomImg(){
 let rand = Math.floor((Math.random() * imgsOnPage) + 1);
 let randImg =document.getElementById(rand+'-img');
 return randImg.src;
}
class Main extends React.Component{
  constructor(){
    super();
    this.imgCount=0;
    this.FetchDataNum=1;
    this.galleryImgs=[];
    this.curSort="day";
    this.prevSort="day";
    this.currPage=0;
    this.link='https://api.imgur.com/3/gallery/t/memes/top/day/';
    this.allImages=[];
    this.state={
      imgs:[]
    }
  }

  componentDidMount(){
    this.FetchData(this.FetchDataNum,this.link);
    window.onscroll =(ev)=> {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            this.CollectImages();
        }
    };
    leftBtn.addEventListener('click',this.ChangeLeft);
    rightBtn.addEventListener('click',this.ChangeRight);

    window.onkeyup = (e) =>{
      var key = e.keyCode ? e.keyCode : e.which;
      if (key ===  37) {
        this.ChangeLeft();
      }else if (key === 39) {
        this.ChangeRight();
      }
    }

  }

  FetchData=(page,link)=>{
      axios.get(link + page, {
        headers: {
          Authorization:client
        }
      })
      .then((response)=> {
        this.galleryImgs= this.FilterData(response.data.data.items);
        this.CollectImages(this.currPage);
      })
      .catch((error) =>{
        console.log(error.config);
      });
  }

  FilterData=(data)=>{
    console.log("All data: ",data);
    const selected = data.filter(word =>word.images_count > 20)
      .map((item)=> { return item.id; });
      return selected;
  }

  CollectImages=()=>{

    if(this.currPage++ >= this.galleryImgs.length){
      this.currPage=0;
      this.FetchDataNum++;
      this.FetchData(this.FetchDataNum);
    }

    else{
      const curId= "https://api.imgur.com/3/gallery/album/"+this.galleryImgs[this.currPage];
      axios.get(curId, {
        headers: {
          Authorization:client
        }
      })
      .then((response)=> {
          this.FormatImg(this.GetLinks(response.data.data));
      })
      .catch((error) =>{
        console.log(error.config);
      });
    }

  }

  GetLinks=(data)=>{
    return data.images.map((item)=> {  return item.link });
  }

  FormatImg=(links)=>{
    var allLinks=links.map((item)=> {
      const id = item.substring(20, 27);
      this.imgCount++;
      const imgNum = this.imgCount;
      imgsOnPage=this.imgCount;
      return (
        <div className="imgBox" key={id}>
          <img id={imgNum+"-img"} src={item} alt="Meme" onClick={(e) => this.ImgClicked(item,imgNum,this.imgCount,e)} ></img>
        </div>
      );

      });

    var stateArr=this.state.imgs;

    allLinks.forEach((link)=> {
      stateArr.push(link);
    });

    this.setState({imgs: stateArr})

    if(imgPlaced===false){
      imgPlaced=true;
      let imgUrl = 'url("'+GetRandomImg()+'")';
      header.style.backgroundImage = imgUrl;
    }
  }

  ImgClicked=(link,id,imgCount,e)=>{
     curImg = id;
     imgsOnPage=imgCount;

     modalImg.setAttribute("src", link);
     modal.style.display='block';
     root.style.display='none';
     document.body.scrollTop = document.documentElement.scrollTop = 0;
  }

  ChangeLeft=()=>{
    if(curImg>1){
      curImg--;
      const prevSrc=document.getElementById(curImg+"-img").getAttribute("src");
      modalImg.setAttribute("src", prevSrc);
    }
  }

  ChangeRight=()=>{
    if(curImg<imgsOnPage){
      curImg++;
      const nextSrc=document.getElementById(curImg+"-img").getAttribute("src");
      modalImg.setAttribute("src", nextSrc);
    }

  }

  ChangeTime=(time,e)=>{

    if(this.prevSort!==time){

      document.getElementById(this.prevSort).style.color ="white";
      var stateArr=[];
      this.setState({imgs: stateArr})
      this.link ='https://api.imgur.com/3/gallery/t/memes/top/'+time;
      this.FetchData(this.FetchDataNum,this.link);
      this.prevSort=time;
      this.curSort=time;
      document.getElementById(time).style.color ="#ffc6c6";
    }

    else{
      this.curSort=time;
    }

  }


  render(){
    return (
      <div id="content-wrap">
        <Header />
        <div id="toolbar-main-container">
          <div className="dropdown" id="window-selector">
            <button className="btn dropdown-toggle" type="button" data-toggle="dropdown">
            Sort<span className="caret">
            </span></button>

            <ul className="dropdown-menu">
              <li className="sortItem"><p id="day" onClick={(e) => this.ChangeTime("day",e)}>Day</p></li>
              <li className="sortItem"><p id="week" onClick={(e) => this.ChangeTime("week",e)}>Week</p></li>
              <li className="sortItem"><p id="month" onClick={(e) => this.ChangeTime("month",e)}>Month</p></li>
              <li className="sortItem"><p id="year" onClick={(e) => this.ChangeTime("year",e)}>Year</p></li>
              <li className="sortItem"><p id="all" onClick={(e) => this.ChangeTime("all",e)}>All</p></li>
            </ul>
          </div>
        </div>

        <div>
          <div id="main-container">
            <div id="wrapper">
              {this.state.imgs}
            </div>
          </div>
      </div>
    </div>
    )

  }
}
class Header extends React.Component{
  componentDidMount(){
    header = document.getElementById("header");
  }
  render(){
    return(
      <div id="upper-div">

        <div id="header-container">
          <div id="header">
            <h1>Meme collector</h1><span></span>
          </div>
        </div>


    </div>
    )
  }
}

ReactDOM.render(<Main />, document.getElementById('main'));
registerServiceWorker();
