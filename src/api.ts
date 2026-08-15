const API_BASE = '/api';

export function getToken(){ return sessionStorage.getItem('haitham_lab_token') || ''; }
export function clearToken(){ sessionStorage.removeItem('haitham_lab_token'); sessionStorage.removeItem('haitham_lab_session'); }

async function request<T>(path:string, options:RequestInit={}) : Promise<T>{
  const headers = new Headers(options.headers);
  headers.set('Content-Type','application/json');
  const token=getToken(); if(token) headers.set('Authorization',`Bearer ${token}`);
  const res=await fetch(`${API_BASE}${path}`,{...options,headers});
  if(!res.ok){ let message='حدث خطأ في الخادم'; try{const e=await res.json(); message=e.error||message;}catch{} throw new Error(message); }
  return res.json();
}

export const api={
  login:(username:string,password:string)=>request<{token:string,user:any}>('/auth/login',{method:'POST',body:JSON.stringify({username,password})}),
  me:()=>request<{user:any}>('/me'),
  tests:()=>request<any[]>('/tests'),
  templates:()=>request<any[]>('/templates'),
  records:()=>request<any[]>('/records'),
  createRecord:(record:any)=>request<any>('/records',{method:'POST',body:JSON.stringify(record)}),
  updateRecord:(id:string,record:any)=>request<any>(`/records/${encodeURIComponent(id)}`,{method:'PUT',body:JSON.stringify(record)}),
  validateRecord:(id:string)=>request<any>(`/records/${encodeURIComponent(id)}/validate`,{method:'POST',body:'{}'}),
  voidRecord:(id:string,reason:string)=>request<any>(`/records/${encodeURIComponent(id)}/void`,{method:'POST',body:JSON.stringify({reason})}),
  addTest:(test:any)=>request<any>('/tests',{method:'POST',body:JSON.stringify(test)}),
  backup:()=>{ const a=document.createElement('a'); a.href='/api/backup/export'; a.download=''; a.click(); }
};
