```javascript
// ===============================
// ストレージキー（GPS版と分離）
// ===============================

const RECORD_KEY = "birdlog_records"
const SPECIES_KEY = "birdlog_species"


// ===============================
// 状態
// ===============================

let count = 0
let approxSymbol = ""

let editIndex = null
let editApproxSymbol = ""


// ===============================
// 種リスト
// ===============================

function getBirdList(){
return JSON.parse(localStorage.getItem(SPECIES_KEY) || "[]")
}

function saveBirdList(list){
localStorage.setItem(SPECIES_KEY,JSON.stringify(list))
}

function renderBirdButtons(){

const area=document.getElementById("birdButtons")
area.innerHTML=""

let list=getBirdList()

list.forEach(bird=>{

let btn=document.createElement("button")
btn.textContent=bird

btn.onclick=function(){
document.getElementById("species").value=bird
}

area.appendChild(btn)

})

renderBirdSettings()

}

function renderBirdSettings(){

const ul=document.getElementById("customBirdList")
ul.innerHTML=""

let list=getBirdList()

list.forEach((bird,i)=>{

let li=document.createElement("li")
li.textContent=bird+" "

let del=document.createElement("button")
del.textContent="×"

del.onclick=function(){

list.splice(i,1)
saveBirdList(list)
renderBirdButtons()

}

li.appendChild(del)

ul.appendChild(li)

})

}

function addBird(){

const name=document.getElementById("newBird").value.trim()

if(!name)return

let list=getBirdList()

if(list.length>=10){

alert("最大10種まで")
return

}

list.push(name)

saveBirdList(list)

document.getElementById("newBird").value=""

renderBirdButtons()

}


// ===============================
// sp ボタン
// ===============================

function toggleSp(){

let input=document.getElementById("species")
let name=input.value.trim()

if(name==="sp."){

input.value=""
return

}

if(name.endsWith(" sp.")){

input.value=name.replace(" sp.","")

}else{

input.value=name!==""?name+" sp.":"sp."

}

}


// ===============================
// 数入力
// ===============================

function plus(){
count++
updateCount()
}

function minus(){

if(count>0)count--

updateCount()

}

function updateCount(){

document.getElementById("count").textContent=count

}

function addNumber(num){

count+=num
updateCount()

}

function resetCount(){

count=0
updateCount()

}


// ===============================
// 概数
// ===============================

function setApprox(symbol){

approxSymbol=(approxSymbol===symbol)?"":symbol

document.getElementById("approx").textContent=approxSymbol

}


// ===============================
// 保存
// ===============================

function saveBird(){

const species=document.getElementById("species").value.trim()

if(!species)return

const finalCount=count+approxSymbol

const record={

species:species,
count:finalCount,
time:new Date()

}

let logs=JSON.parse(localStorage.getItem(RECORD_KEY)||"[]")

logs.push(record)

localStorage.setItem(RECORD_KEY,JSON.stringify(logs))

count=0
approxSymbol=""

updateCount()

document.getElementById("approx").textContent=""
document.getElementById("species").value=""

showLogs()
showSummary()
showTimeSummary()
showTimeSpeciesSummary()
exportText()

}


// ===============================
// 今日の記録表示
// ===============================

function showLogs(){

let logs=JSON.parse(localStorage.getItem(RECORD_KEY)||"[]")

const list=document.getElementById("list")

list.innerHTML=""

const today=new Date().toDateString()

logs.forEach((r,index)=>{

if(new Date(r.time).toDateString()!==today)return

let date=new Date(r.time)

let timeText=date.getHours()+":"+String(date.getMinutes()).padStart(2,"0")

let li=document.createElement("li")

li.textContent=timeText+" "+r.species+" "+r.count+" "

let editBtn=document.createElement("button")
editBtn.textContent="編集"
editBtn.onclick=function(){editRecord(index)}

let delBtn=document.createElement("button")
delBtn.textContent="削除"
delBtn.onclick=function(){deleteRecord(index)}

li.appendChild(editBtn)
li.appendChild(delBtn)

list.appendChild(li)

})

}


// ===============================
// 削除
// ===============================

function deleteRecord(index){

let logs=JSON.parse(localStorage.getItem(RECORD_KEY)||"[]")

logs.splice(index,1)

localStorage.setItem(RECORD_KEY,JSON.stringify(logs))

showLogs()
showSummary()
showTimeSummary()
showTimeSpeciesSummary()
exportText()

}


// ===============================
// 編集
// ===============================

function editRecord(index){

let logs=JSON.parse(localStorage.getItem(RECORD_KEY)||"[]")

let r=logs[index]

editIndex=index

document.getElementById("editSpecies").value=r.species

let num=r.count.replace(/[+\-±]/g,"")
let symbol=r.count.replace(/[0-9]/g,"")

document.getElementById("editCount").value=num

editApproxSymbol=symbol

document.getElementById("editApprox").textContent=symbol

document.getElementById("editModal").style.display="block"

}

function setEditApprox(symbol){

editApproxSymbol=(editApproxSymbol===symbol)?"":symbol

document.getElementById("editApprox").textContent=editApproxSymbol

}

function updateRecord(){

let logs=JSON.parse(localStorage.getItem(RECORD_KEY)||"[]")

let species=document.getElementById("editSpecies").value.trim()

let countValue=document.getElementById("editCount").value

let r=logs[editIndex]

logs[editIndex]={

species:species,
count:countValue+editApproxSymbol,
time:r.time

}

localStorage.setItem(RECORD_KEY,JSON.stringify(logs))

closeEditModal()

showLogs()
showSummary()
showTimeSummary()
showTimeSpeciesSummary()
exportText()

}

function closeEditModal(){

document.getElementById("editModal").style.display="none"

}


// ===============================
// 数値抽出
// ===============================

function extractNumber(count){

let num=parseInt(count.replace(/[^\d]/g,""))

return isNaN(num)?0:num

}


// ===============================
// 種ごとの合計
// ===============================

function showSummary(){

let logs=JSON.parse(localStorage.getItem(RECORD_KEY)||"[]")

const today=new Date().toDateString()

let speciesTotal={}

logs.forEach(r=>{

if(new Date(r.time).toDateString()!==today)return

let species=r.species

let num=extractNumber(r.count)

if(!speciesTotal[species])speciesTotal[species]=0

speciesTotal[species]+=num

})

let text=""

Object.keys(speciesTotal).sort().forEach(s=>{

text+=s+" : "+speciesTotal[s]+"\n"

})

document.getElementById("summaryArea").textContent=text

}


// ===============================
// 時間ごとの合計
// ===============================

function showTimeSummary(){

let logs=JSON.parse(localStorage.getItem(RECORD_KEY)||"[]")

const today=new Date().toDateString()

let timeTotal={}

logs.forEach(r=>{

if(new Date(r.time).toDateString()!==today)return

let hour=new Date(r.time).getHours()

let num=extractNumber(r.count)

if(!timeTotal[hour])timeTotal[hour]=0

timeTotal[hour]+=num

})

let text=""

Object.keys(timeTotal).sort((a,b)=>a-b).forEach(h=>{

text+=String(h).padStart(2,"0")+"時 : "+timeTotal[h]+"\n"

})

document.getElementById("timeSummaryArea").textContent=text

}


// ===============================
// 時間 × 種別 集計
// ===============================

function showTimeSpeciesSummary(){

let logs=JSON.parse(localStorage.getItem(RECORD_KEY)||"[]")

const today=new Date().toDateString()

let table={}

logs.forEach(r=>{

if(new Date(r.time).toDateString()!==today)return

let hour=new Date(r.time).getHours()
let species=r.species
let num=extractNumber(r.count)

if(!table[hour]) table[hour]={}

if(!table[hour][species]) table[hour][species]=0

table[hour][species]+=num

})

let text=""

Object.keys(table).sort((a,b)=>a-b).forEach(hour=>{

text+=String(hour).padStart(2,"0")+"時\n"

Object.keys(table[hour]).sort().forEach(species=>{

text+=species+" : "+table[hour][species]+"\n"

})

text+="\n"

})

document.getElementById("timeSpeciesArea").textContent=text

}


// ===============================
// テキスト出力
// ===============================

function exportText(){

const logs=JSON.parse(localStorage.getItem(RECORD_KEY)||"[]")

const today=new Date().toDateString()

let text=""

logs.forEach(r=>{

if(new Date(r.time).toDateString()!==today)return

let date=new Date(r.time)

let timeText=date.getHours()+":"+String(date.getMinutes()).padStart(2,"0")

text+=timeText+" "+r.species+" "+r.count+"\n"

})

document.getElementById("exportAreaText").textContent=text

}


// ===============================
// 開閉
// ===============================

function toggleSection(id){

const section=document.getElementById(id)

section.style.display=
(section.style.display==="none"||section.style.display==="")?
"block":"none"

}


// ===============================
// 今日の記録削除
// ===============================

function clearTodayLogs(){

if(!confirm("今日の記録をすべて削除します。よろしいですか？"))return

let logs=JSON.parse(localStorage.getItem(RECORD_KEY)||"[]")

const today=new Date().toDateString()

logs=logs.filter(r=>new Date(r.time).toDateString()!==today)

localStorage.setItem(RECORD_KEY,JSON.stringify(logs))

showLogs()
showSummary()
showTimeSummary()
showTimeSpeciesSummary()
exportText()

}


// ===============================
// 初期化
// ===============================

renderBirdButtons()
updateCount()
showLogs()
showSummary()
showTimeSummary()
showTimeSpeciesSummary()
exportText()
```
