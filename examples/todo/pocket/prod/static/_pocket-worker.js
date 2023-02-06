"use strict";(()=>{var oe=Object.create,L=Object.freeze,w=Object.defineProperty;var ne=Object.getOwnPropertyDescriptor;var re=Object.getOwnPropertyNames;var se=Object.getPrototypeOf,ie=Object.prototype.hasOwnProperty;var ae=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports),x=(t,e)=>{for(var o in e)w(t,o,{get:e[o],enumerable:!0})},ce=(t,e,o,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of re(e))!ie.call(t,r)&&r!==o&&w(t,r,{get:()=>e[r],enumerable:!(n=ne(e,r))||n.enumerable});return t};var ue=(t,e,o)=>(o=t!=null?oe(se(t)):{},ce(e||!t||!t.__esModule?w(o,"default",{value:t,enumerable:!0}):o,t));var k=(t,e)=>L(w(t,"raw",{value:L(e||t.slice())}));var H=ae((Le,j)=>{"use strict";var fe=/["'&<>]/;j.exports=pe;function pe(t){var e=""+t,o=fe.exec(e);if(!o)return e;var n,r="",s=0,i=0;for(s=o.index;s<e.length;s++){switch(e.charCodeAt(s)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 39:n="&#39;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}i!==s&&(r+=e.substring(i,s)),i=s+1,r+=n}return i!==s?r+e.substring(i,s):r}});function le(t){var e;return(e=t==null?void 0:t.split(";").map(o=>{let n=o.indexOf("=");return{name:o.slice(0,n).trim(),value:decodeURIComponent(o.slice(n+1).trim())}}))!==null&&e!==void 0?e:[]}function de(t){let e=`${t.name}=${encodeURIComponent(t.value)}`;return t.path&&(e+=`;Path=${t.path}`),t.expires&&(e+=`;Expires=${t.expires.toUTCString()}`),t.maxAge&&(e+=`;MaxAge=${t.maxAge}`),t.sameSite?e+=`;SameSite=${t.sameSite===!0?"Strict":t.sameSite}`:e+=";SameSite=Lax",t.secure&&(e+=";Secure"),t.httpOnly&&(e+=";HttpOnly"),e}var b=class{constructor(e){this.cookies=new Map(e.map(o=>[o.name,o]))}get size(){return this.cookies.size}get(e){return this.cookies.get(e)}getAll(e){if(e){let o=this.cookies.get(e);return o?[o]:[]}return Array.from(this.cookies.values())}has(e){return this.cookies.has(e)}set(e,o){return this.cookies.set(e,{name:e,value:o}),this}delete(e){return Array.isArray(e)?e.map(o=>this.cookies.delete(o)):this.cookies.delete(e)}clear(){return this.cookies.clear(),this}toString(){return Array.from(this.cookies.values()).map(e=>`${e.name}=${encodeURIComponent(e.value)}`).join(";")}},v=class{constructor(e,o){this.cookies=le(e.get("Set-Cookie")).map(n=>({path:"/",...n})),o&&this.cookies.push(...o)}get(e){return this.cookies.reverse().find(o=>o.name===e)}getAll(e){if(e){let n=this.get(e);return n?[n]:[]}let o=new Map;for(let n of this.cookies)o.set(n.name,n);return Array.from(o.values())}set(e,o,n){return typeof e=="object"?(this.cookies.push(e),this):(this.cookies.push({...n,name:e,value:o}),this)}delete(e,o){return this.cookies.push({name:e,value:"",maxAge:0,...o}),this}toString(){return this.getAll().map(de).join(",")}};var S=class extends Request{constructor(e,o){super(e),this.cookies=o}};var F=ue(H(),1);function u(t,...e){return new l(t,e)}u.raw=function(e){return new l([e],[])};u.wrap=function(e){return{html(o,...n){return e(new l(o,n))}}};var je=u.wrap,l=class{constructor(e,o){if(this.strings=e,this.args=o,e.length===o.length)this.strings=[...e,""];else if(e.length!==o.length+1)throw new Error("strings.length must be args.length + 1")}renderToStream(){let e=[...this.strings],o=[...this.args],n=new TextEncoder;return new ReadableStream({async start(r){for(;e.length>0;){let s=e.shift(),i=o.shift();s&&r.enqueue(n.encode(s));let d=Array.isArray(i)?i:[i];for(let c of d){let a=await c;if(a){if(typeof a=="string"){r.enqueue(n.encode((0,F.default)(a)));continue}if(typeof a=="number"){r.enqueue(n.encode(a.toString()));continue}if("then"in a){e.unshift(""),o.unshift(await a);continue}if(a instanceof l){e.unshift(...a.strings),o.unshift(...a.args,"");continue}throw console.error("wrong arg",c,l),new TypeError("Argument is not of any allowed type")}}}r.close()}})}async renderToString(){let e=this.renderToStream(),o=new TextDecoder,n=e.getReader(),r=[];for(;;){console.log("read next value");let{done:s,value:i}=await n.read();if(console.log("read value"),s)return r.join("");r.push(o.decode(i))}}static from(e){return e instanceof l?e:new l([""],[e])}static join(...e){let o=[],n=[];for(let r of e)for(o.push(...r.strings),n.push(...r.args);o.length>n.length;)n.push("");return new l(o,n)}},U,he=u(U||(U=k([`
  <script
    defer
    src="/_pocket/runtime.js"
    id="pocket-runtime"
    data-env="`,`"
  ><\/script>
`])),"worker");var f=class extends Response{constructor(e,o){super(e instanceof l?e.renderToStream():e,o);let n=(o==null?void 0:o.headers)instanceof Headers?o.headers:new Headers(o==null?void 0:o.headers);if(this.cookies=new v(n),o!=null&&o.cookies)for(let r of o.cookies)this.cookies.set(r);e instanceof l&&this.headers.set("Conent-Type","text/html")}};var N;function V(t){let e=u(N||(N=k([`
    <script
      defer
      src="/_pocket/runtime.js"
      id="pocket-runtime"
      data-env="`,`"
    ><\/script>
  `])),"worker");return t.css?u`
      ${e}
      <link rel="stylesheet" href="${t.css}" />
    `:e}function C(t={}){return new Response("404 Not Found",{status:404,statusText:"Not Found",...t})}async function W({methods:t,layouts:e,css:o},n){console.log("handleRoute");let r=t[n.method.toLowerCase()];if(!r&&!t.body)return C();let s;if(t.body){let d=function(c){let a=l.from(t.body({req:n,props:c})),h=[];t.head&&h.push(l.from(t.head({req:n,props:c})));for(let m of e)m.layout.head&&h.unshift(l.from(m.layout.head({req:n}))),m.layout.body&&(a=l.from(m.layout.body({req:n,children:a})));return new l(["<!DOCTYPE html><html><head>","","</head><body>","</body></html>"],[h,V({css:o}),a])};var i=d;r?s=await r({req:n,render:d}):s=new f(d(void 0)),s instanceof Response||(s=new f(s))}else if(r)console.log("api handler"),s=await r({req:n});else return console.log("not found"),C();return s instanceof Response||(s=new f(s)),s}var me=(t,e)=>e.some(o=>t instanceof o),_,K;function ge(){return _||(_=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function ye(){return K||(K=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var q=new WeakMap,R=new WeakMap,J=new WeakMap,D=new WeakMap,A=new WeakMap;function we(t){let e=new Promise((o,n)=>{let r=()=>{t.removeEventListener("success",s),t.removeEventListener("error",i)},s=()=>{o(p(t.result)),r()},i=()=>{n(t.error),r()};t.addEventListener("success",s),t.addEventListener("error",i)});return e.then(o=>{o instanceof IDBCursor&&q.set(o,t)}).catch(()=>{}),A.set(e,t),e}function xe(t){if(R.has(t))return;let e=new Promise((o,n)=>{let r=()=>{t.removeEventListener("complete",s),t.removeEventListener("error",i),t.removeEventListener("abort",i)},s=()=>{o(),r()},i=()=>{n(t.error||new DOMException("AbortError","AbortError")),r()};t.addEventListener("complete",s),t.addEventListener("error",i),t.addEventListener("abort",i)});R.set(t,e)}var P={get(t,e,o){if(t instanceof IDBTransaction){if(e==="done")return R.get(t);if(e==="objectStoreNames")return t.objectStoreNames||J.get(t);if(e==="store")return o.objectStoreNames[1]?void 0:o.objectStore(o.objectStoreNames[0])}return p(t[e])},set(t,e,o){return t[e]=o,!0},has(t,e){return t instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in t}};function O(t){P=t(P)}function ke(t){return t===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...o){let n=t.call(T(this),e,...o);return J.set(n,e.sort?e.sort():[e]),p(n)}:ye().includes(t)?function(...e){return t.apply(T(this),e),p(q.get(this))}:function(...e){return p(t.apply(T(this),e))}}function be(t){return typeof t=="function"?ke(t):(t instanceof IDBTransaction&&xe(t),me(t,ge())?new Proxy(t,P):t)}function p(t){if(t instanceof IDBRequest)return we(t);if(D.has(t))return D.get(t);let e=be(t);return e!==t&&(D.set(t,e),A.set(e,t)),e}var T=t=>A.get(t);function X(t,e,{blocked:o,upgrade:n,blocking:r,terminated:s}={}){let i=indexedDB.open(t,e),d=p(i);return n&&i.addEventListener("upgradeneeded",c=>{n(p(i.result),c.oldVersion,c.newVersion,p(i.transaction),c)}),o&&i.addEventListener("blocked",c=>o(c.oldVersion,c.newVersion,c)),d.then(c=>{s&&c.addEventListener("close",()=>s()),r&&c.addEventListener("versionchange",a=>r(a.oldVersion,a.newVersion,a))}).catch(()=>{}),d}var ve=["get","getKey","getAll","getAllKeys","count"],Se=["put","add","delete","clear"],I=new Map;function z(t,e){if(!(t instanceof IDBDatabase&&!(e in t)&&typeof e=="string"))return;if(I.get(e))return I.get(e);let o=e.replace(/FromIndex$/,""),n=e!==o,r=Se.includes(o);if(!(o in(n?IDBIndex:IDBObjectStore).prototype)||!(r||ve.includes(o)))return;let s=async function(i,...d){let c=this.transaction(i,r?"readwrite":"readonly"),a=c.store;return n&&(a=a.index(d.shift())),(await Promise.all([a[o](...d),r&&c.done]))[0]};return I.set(e,s),s}O(t=>({...t,get:(e,o,n)=>z(e,o)||t.get(e,o,n),has:(e,o)=>!!z(e,o)||t.has(e,o)}));var g=null;async function E(){return g=g!=null?g:await X("_pocket",2,{upgrade(t){console.log("upgrade"),t.createObjectStore("cookies",{keyPath:"name"}),t.createObjectStore("data"),console.log("upgrade done")}}),g}async function Y(){return(await(await E()).getAll("cookies")).filter(o=>!o.name.startsWith("_pocket"))}async function G(t){if(console.log("set",t),t.length===0)return;let e=await E();console.log("set cookies",t);let o=e.transaction("cookies","readwrite");for(let n of t)await o.store.put(n);await o.store.put({name:"_pocket_ts",value:Math.floor(Date.now()/1e3).toString(),path:"/",maxAge:3456e4}),o.commit()}async function Q(t){console.log(t);async function e(o){let n=new URL(o.request.url);if(n.hostname!==location.hostname)return fetch(o.request);for(let r of t){if(console.log("match",r.path,n.pathname),n.pathname!==r.path)continue;let s=await Y(),i=new S(o.request,new b(s)),d=await W(r,i);d.headers.set("Server","Pocket Worker");let c=d instanceof f?d.cookies.getAll():null;return console.log("response cookie",c),c&&o.waitUntil((async()=>{await G(c);let a=await clients.get(o.clientId);console.log({client:a});let h={type:"sync-cookies"};a?.postMessage(h)})()),console.log("retrrn",d.headers,o),d}return console.log("fetch fallback",o.request.url),fetch(o.request)}addEventListener("fetch",o=>{let n=o;console.log("fetchevent",n.request.method,n.request.url),n.respondWith(e(n))})}var B={};x(B,{body:()=>Ce});function Z(t){return u`
    <table>
      <thead>
        ${t.head}
      </thead>
      <tbody>
        ${t.body}
      </tbody>
    </table>
  `}function Ce(){return u`
    <main>
      ${Z({head:u`
          <tr>
            <th>Kind</th>
            <th>Datum</th>
          </tr>
        `,body:u`
          <tr>
            <td>Tel</td>
            <td>123456789</td>
          </tr>
          <tr>
            <td>Email</td>
            <td>contact@todo.pocket</td>
          </tr>
        `})}
    </main>
  `}var $={};x($,{body:()=>De,get:()=>Re,post:()=>Pe});var ee=(t=21)=>crypto.getRandomValues(new Uint8Array(t)).reduce((e,o)=>(o&=63,o<36?e+=o.toString(36):o<62?e+=(o-26).toString(36).toUpperCase():o>62?e+="-":e+="_",e),"");function De({props:t}){return u`
    <h1>Pocket Todos</h1>
    <form method="POST">
      <input type="hidden" name="id" value="${ee()}" />
      <input type="text" name="title" />
      <button>Add</button>
    </form>
    <ul>
      ${t.todos.map(e=>{let o=`fetch('/todo', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: '{            \\"id\\": \\"${e.id}\\",            \\"title\\": \\"${e.title}\\",            \\"done\\": ${e.done?"false":"true"}          }'
        })`;return u`<li>
          <input
            type="checkbox"
            ${e.done?"checked":""}
            onchange="${o}"
          />${e.title}
        </li>`})}
    </ul>
  `}async function Re({req:t,render:e}){var r;let o=(r=t.cookies.get("pocket-todos"))==null?void 0:r.value,n=o?JSON.parse(o):[];return e({todos:n})}async function Pe({req:t,render:e}){var c,a,h;let o=await t.formData(),n=(c=t.cookies.get("pocket-todos"))==null?void 0:c.value,r=n?JSON.parse(n):[],s=(a=o.get("title"))==null?void 0:a.toString(),i=(h=o.get("id"))==null?void 0:h.toString();i&&s&&!r.some(m=>m.id===i)&&r.unshift({id:i,title:s,done:!1});let d=new f(e({todos:r}));return d.cookies.set("pocket-todos",JSON.stringify(r),{path:"/"}),d}var M={};x(M,{put:()=>Ae});async function Ae({req:t}){var s;let e=(s=t.cookies.get("pocket-todos"))==null?void 0:s.value,o=e?JSON.parse(e):[],n=await t.json(),r=o.findIndex(i=>i.id===n.id);return r!==-1?(o[r]=n,new f(null,{cookies:[{name:"pocket-todos",value:JSON.stringify(o),path:"/"}]})):(o.unshift(n),new f(null,{cookies:[{name:"pocket-todos",value:JSON.stringify(o),path:"/"}]}))}var y={};x(y,{body:()=>Ee,layout:()=>Ie});function te(){return u`
    <nav>
      <ul>
        <li><a href="/" soft>Home</a></li>
        <li><a href="/contact" soft>Contact</a></li>
      </ul>
    </nav>
  `}function Ie(){return u`
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pocket Todos</title>
  `}function Ee({children:t}){return u`${te()}${t}`}Q([{path:"/contact",methods:B,css:null,client:null,layouts:[{path:"/",layout:y,pathDigest:"0cc7d9"}]},{path:"/",methods:$,css:null,client:null,layouts:[{path:"/",layout:y,pathDigest:"0cc7d9"}]},{path:"/todo",methods:M,css:null,client:null,layouts:[{path:"/",layout:y,pathDigest:"0cc7d9"}]}]);})();
/*! Bundled license information:

escape-html/index.js:
  (*!
   * escape-html
   * Copyright(c) 2012-2013 TJ Holowaychuk
   * Copyright(c) 2015 Andreas Lubbe
   * Copyright(c) 2015 Tiancheng "Timothy" Gu
   * MIT Licensed
   *)
*/
