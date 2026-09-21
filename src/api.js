export async function api(path, options={}) {
 const response=await fetch(`/api${path}`,{credentials:'same-origin',...options,headers:{'Content-Type':'application/json',...options.headers},body:options.body?JSON.stringify(options.body):undefined});
 const data=await response.json();
 if(!response.ok) throw Object.assign(new Error(data.error||'Request failed'),{status:response.status});
 return data;
}
export const saveRecord=(kind,title,data)=>api('/records',{method:'POST',body:{kind,title,data}});
export function download(name,content,type='text/plain'){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
