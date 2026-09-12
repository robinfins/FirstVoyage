/* Four-digit gate in front of the build.

   This is a doorbell, not a lock. Everything here runs on the visitor's machine, so anyone who
   opens devtools can read the check or simply delete the overlay, and four digits is ten thousand
   guesses for a script. It keeps a link from being casually wandered into and nothing more.
   For access control that actually holds, put the site behind the host's own password — see the
   hosting notes in docs/HOSTING.md.

   The code is stored as a salted FNV-1a hash rather than in plain text, so "view source" does not
   hand it over. FNV is not a password hash; it is here only to avoid printing the digits. */
(function(){
'use strict';
const EXPECT=0x443b2deb, SALT='::first-voyage', REMEMBER='first-voyage-gate';
function hash(s){let h=2166136261;
 for(const ch of (s+SALT))
  {h^=ch.codePointAt(0);h=Math.imul(h,16777619)>>>0;}
 return h>>>0;}

const gate=document.getElementById('gate'),input=document.getElementById('gate-pin'),
      msg=document.getElementById('gate-msg'),dots=document.getElementById('gate-dots');
if(!gate)return;

function open(remember){
 if(remember){try{localStorage.setItem(REMEMBER,'1');}catch{}}
 gate.hidden=true;document.body.classList.remove('locked');
 // Hand focus to the game so the first keystroke after unlocking is not swallowed.
 const canvas=document.getElementById('game');if(canvas)canvas.focus();
}
let remembered=false;
try{remembered=localStorage.getItem(REMEMBER)==='1';}catch{}
if(remembered){open(false);return;}

document.body.classList.add('locked');
function paint(){const n=input.value.length;
 dots.textContent='••••'.slice(0,n)+'____'.slice(0,4-n);}
function wrong(){
 msg.textContent='Not that one. Try again.';
 gate.classList.add('shake');setTimeout(()=>gate.classList.remove('shake'),420);
 input.value='';paint();
}
input.addEventListener('input',()=>{
 input.value=input.value.replace(/\D/g,'').slice(0,4);   // digits only, never longer than four
 msg.textContent='';paint();
 if(input.value.length===4){
  if(hash(input.value)===EXPECT)open(true);else wrong();
 }
});
// The overlay owns the keyboard until it is dismissed.
gate.addEventListener('click',()=>input.focus());
window.addEventListener('load',()=>input.focus());
paint();input.focus();
})();
