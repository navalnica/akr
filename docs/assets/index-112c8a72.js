(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const f of document.querySelectorAll('link[rel="modulepreload"]'))r(f);new MutationObserver(f=>{for(const l of f)if(l.type==="childList")for(const a of l.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function n(f){const l={};return f.integrity&&(l.integrity=f.integrity),f.referrerPolicy&&(l.referrerPolicy=f.referrerPolicy),f.crossOrigin==="use-credentials"?l.credentials="include":f.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function r(f){if(f.ep)return;f.ep=!0;const l=n(f);fetch(f.href,l)}})();function A(){}function Y(e){return e()}function $(){return Object.create(null)}function P(e){e.forEach(Y)}function D(e){return typeof e=="function"}function V(e,t){return e!=e?t==t:e!==t||e&&typeof e=="object"||typeof e=="function"}function W(e){return Object.keys(e).length===0}function E(e,t){e.appendChild(t)}function m(e,t,n){e.insertBefore(t,n||null)}function _(e){e.parentNode&&e.parentNode.removeChild(e)}function k(e){return document.createElement(e)}function y(e){return document.createTextNode(e)}function w(){return y(" ")}function X(){return y("")}function L(e,t,n,r){return e.addEventListener(t,n,r),()=>e.removeEventListener(t,n,r)}function g(e,t,n){n==null?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function Z(e){return Array.from(e.childNodes)}function T(e,t){t=""+t,e.data!==t&&(e.data=t)}function I(e,t){e.value=t??""}let S;function M(e){S=e}const C=[],v=[];let O=[];const B=[],x=Promise.resolve();let G=!1;function ee(){G||(G=!0,x.then(J))}function R(e){O.push(e)}const j=new Set;let N=0;function J(){if(N!==0)return;const e=S;do{try{for(;N<C.length;){const t=C[N];N++,M(t),te(t.$$)}}catch(t){throw C.length=0,N=0,t}for(M(null),C.length=0,N=0;v.length;)v.pop()();for(let t=0;t<O.length;t+=1){const n=O[t];j.has(n)||(j.add(n),n())}O.length=0}while(C.length);for(;B.length;)B.pop()();G=!1,j.clear(),M(e)}function te(e){if(e.fragment!==null){e.update(),P(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(R)}}function ne(e){const t=[],n=[];O.forEach(r=>e.indexOf(r)===-1?t.push(r):n.push(r)),n.forEach(r=>r()),O=t}const re=new Set;function fe(e,t){e&&e.i&&(re.delete(e),e.i(t))}function le(e,t,n,r){const{fragment:f,after_update:l}=e.$$;f&&f.m(t,n),r||R(()=>{const a=e.$$.on_mount.map(Y).filter(D);e.$$.on_destroy?e.$$.on_destroy.push(...a):P(a),e.$$.on_mount=[]}),l.forEach(R)}function se(e,t){const n=e.$$;n.fragment!==null&&(ne(n.after_update),P(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}function ue(e,t){e.$$.dirty[0]===-1&&(C.push(e),ee(),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function oe(e,t,n,r,f,l,a,b=[-1]){const d=S;M(e);const s=e.$$={fragment:null,ctx:[],props:l,update:A,not_equal:f,bound:$(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(t.context||(d?d.$$.context:[])),callbacks:$(),dirty:b,skip_bound:!1,root:t.target||d.$$.root};a&&a(s.root);let p=!1;if(s.ctx=n?n(e,t.props||{},(c,o,...i)=>{const u=i.length?i[0]:o;return s.ctx&&f(s.ctx[c],s.ctx[c]=u)&&(!s.skip_bound&&s.bound[c]&&s.bound[c](u),p&&ue(e,c)),o}):[],s.update(),p=!0,P(s.before_update),s.fragment=r?r(s.ctx):!1,t.target){if(t.hydrate){const c=Z(t.target);s.fragment&&s.fragment.l(c),c.forEach(_)}else s.fragment&&s.fragment.c();t.intro&&fe(e.$$.fragment),le(e,t.target,t.anchor,t.customElement),J()}M(d)}class ie{$destroy(){se(this,1),this.$destroy=A}$on(t,n){if(!D(n))return A;const r=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return r.push(n),()=>{const f=r.indexOf(n);f!==-1&&r.splice(f,1)}}$set(t){this.$$set&&!W(t)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}function H(e){let t,n,r,f,l,a,b;return{c(){t=k("p"),n=y("Number: "),r=y(e[8]),f=w(),l=k("button"),l.textContent="Ready"},m(d,s){m(d,t,s),E(t,n),E(t,r),m(d,f,s),m(d,l,s),a||(b=L(l,"click",e[9]),a=!0)},p(d,s){s&256&&T(r,d[8])},d(d){d&&_(t),d&&_(f),d&&_(l),a=!1,b()}}}function q(e){let t,n,r,f,l,a,b,d,s,p,c,o,i=e[2]&&z(e);return{c(){t=k("label"),t.textContent="Your guess",n=w(),r=k("input"),f=w(),l=k("button"),a=y("Check"),b=w(),d=k("button"),d.textContent="Restart",s=w(),i&&i.c(),p=X(),g(t,"for","input-guess"),g(r,"type","text"),g(r,"id","input-guess"),g(l,"id","button-check"),l.disabled=e[5],g(d,"id","button-restart")},m(u,h){m(u,t,h),m(u,n,h),m(u,r,h),I(r,e[3]),m(u,f,h),m(u,l,h),E(l,a),m(u,b,h),m(u,d,h),m(u,s,h),i&&i.m(u,h),m(u,p,h),c||(o=[L(r,"input",e[13]),L(r,"input",e[14]),L(l,"click",e[10]),L(d,"click",e[12])],c=!0)},p(u,h){h&8&&r.value!==u[3]&&I(r,u[3]),h&32&&(l.disabled=u[5]),u[2]?i?i.p(u,h):(i=z(u),i.c(),i.m(p.parentNode,p)):i&&(i.d(1),i=null)},d(u){u&&_(t),u&&_(n),u&&_(r),u&&_(f),u&&_(l),u&&_(b),u&&_(d),u&&_(s),i&&i.d(u),u&&_(p),c=!1,P(o)}}}function z(e){let t,n;return{c(){t=k("p"),n=y(e[4])},m(r,f){m(r,t,f),E(t,n)},p(r,f){f&16&&T(n,r[4])},d(r){r&&_(t)}}}function ce(e){let t,n,r,f,l,a,b,d,s,p=e[0]&&H(e),c=e[1]&&q(e);return{c(){p&&p.c(),t=w(),c&&c.c(),n=w(),r=k("p"),f=y("Correct: "),l=y(e[6]),a=y(". Mistakes: "),b=y(e[7]),d=w(),s=k("a"),s.innerHTML='<i class="fa-brands fa-github" style="font-size:18px"></i> GitHub',g(s,"href","https://github.com/navalnica/akr"),g(s,"target","_blank"),g(s,"rel","noreferrer")},m(o,i){p&&p.m(o,i),m(o,t,i),c&&c.m(o,i),m(o,n,i),m(o,r,i),E(r,f),E(r,l),E(r,a),E(r,b),m(o,d,i),m(o,s,i)},p(o,[i]){o[0]?p?p.p(o,i):(p=H(o),p.c(),p.m(t.parentNode,t)):p&&(p.d(1),p=null),o[1]?c?c.p(o,i):(c=q(o),c.c(),c.m(n.parentNode,n)):c&&(c.d(1),c=null),i&64&&T(l,o[6]),i&128&&T(b,o[7])},i:A,o:A,d(o){p&&p.d(o),o&&_(t),c&&c.d(o),o&&_(n),o&&_(r),o&&_(d),o&&_(s)}}}const F=1e5,K=1e6;function U(e,t){return Math.floor(Math.random()*(t-e)+e)}function de(e,t,n){let r=!0,f=!1,l=!1,a="",b="",d=!1,s=0,p=0,c=U(F,K);function o(){n(0,r=!1),n(1,f=!0),n(2,l=!1)}function i(){n(2,l=!0),a==c?(n(4,b="Correct"),n(6,s+=1),n(5,d=!0)):(n(4,b="Mistake"),n(7,p+=1))}function u(){n(2,l=!1)}function h(){n(8,c=U(F,K)),n(1,f=!1),n(0,r=!0),n(3,a=""),n(5,d=!1)}function Q(){a=this.value,n(3,a)}return[r,f,l,a,b,d,s,p,c,o,i,u,h,Q,_e=>u()]}class pe extends ie{constructor(t){super(),oe(this,t,de,ce,V,{})}}new pe({target:document.getElementById("app")});
