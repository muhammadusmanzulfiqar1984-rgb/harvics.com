'use client'
/** #21 Recipe Management — recipe scaling */
import { useEffect, useState } from 'react'
const B='var(--harvics-burgundy)'; const G='var(--harvics-gold)'; const C='var(--harvics-cream)'
interface Ing{id:string;ingredient:string;qty:number;uom:string;unitCost:number}
interface Rec{id:string;code:string;name:string;category:string|null;baseYield:number;baseUom:string;ingredients:Ing[]}
export default function RecipePage(){
  const [recs,setRecs]=useState<Rec[]>([])
  const [sel,setSel]=useState<Rec|null>(null)
  const [form,setForm]=useState({code:'',name:'',category:'',baseYield:1,baseUom:'L'})
  const [ing,setIng]=useState({ingredient:'',qty:1,uom:'kg',unitCost:0})
  const [target,setTarget]=useState(10)
  const [scaled,setScaled]=useState<any>(null)
  const load=async()=>{setRecs((await(await fetch('/api/wave4/recipes',{cache:'no-store'})).json()).data||[])}
  useEffect(()=>{void load()},[])
  const create=async()=>{if(!form.code||!form.name)return alert('Code+name required');const r=await(await fetch('/api/wave4/recipes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})).json();if(!r.success)return alert(JSON.stringify(r.issues||r.error));setForm({...form,code:'',name:''});await load()}
  const addIng=async()=>{if(!sel)return;if(!ing.ingredient||ing.qty<=0)return alert('Ingredient+qty required');const r=await(await fetch(`/api/wave4/recipes/${sel.id}/ingredients`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(ing)})).json();if(!r.success)return alert(JSON.stringify(r.issues||r.error));setIng({ingredient:'',qty:1,uom:'kg',unitCost:0});await load();const fresh=(await(await fetch('/api/wave4/recipes',{cache:'no-store'})).json()).data;setSel(fresh.find((x:Rec)=>x.id===sel.id)||null)}
  const scale=async()=>{if(!sel)return;const r=await(await fetch(`/api/wave4/recipes/${sel.id}/scale?yield=${target}`)).json();if(!r.success)return alert(r.error);setScaled(r.data)}
  return(<div style={{fontFamily:'system-ui',minHeight:'100vh',background:C}}>
    <Hdr no="#21" band="MANUFACTURING & OPERATIONS" title="Recipe Management" sub="F&B recipes with scaling and cost-per-unit calc"/>
    <div style={{padding:'12px 24px 24px',display:'grid',gridTemplateColumns:'1fr 2fr',gap:16}}>
      <Panel title="RECIPES">
        <Form><Inp l="Code *" v={form.code} on={v=>setForm({...form,code:v})}/><Inp l="Name *" v={form.name} on={v=>setForm({...form,name:v})}/><Inp l="Category" v={form.category} on={v=>setForm({...form,category:v})}/><Inp l="Base yield" tp="number" v={String(form.baseYield)} on={v=>setForm({...form,baseYield:+v})}/><Inp l="UoM" v={form.baseUom} on={v=>setForm({...form,baseUom:v})}/></Form>
        <button onClick={create} style={btnB}>+ NEW RECIPE</button>
        <Tbl head={['CODE','NAME','YLD']}>{recs.map(r=><tr key={r.id} onClick={()=>{setSel(r);setScaled(null)}} style={{borderBottom:`1px solid ${B}11`,cursor:'pointer',background:sel?.id===r.id?C:'#fff'}}><td style={td}>{r.code}</td><td style={td}>{r.name}</td><td style={td}>{r.baseYield} {r.baseUom}</td></tr>)}</Tbl>
      </Panel>
      <Panel title={sel?`${sel.code} — ${sel.name}`:'Select a recipe'}>
        {!sel?<div style={{padding:24,color:'#888',textAlign:'center'}}>Pick a recipe to add ingredients and scale</div>:(<>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr auto',gap:6,alignItems:'end'}}>
            <Inp l="Ingredient *" v={ing.ingredient} on={v=>setIng({...ing,ingredient:v})}/>
            <Inp l="Qty *" tp="number" v={String(ing.qty)} on={v=>setIng({...ing,qty:+v})}/>
            <Inp l="UoM" v={ing.uom} on={v=>setIng({...ing,uom:v})}/>
            <Inp l="Unit cost" tp="number" v={String(ing.unitCost)} on={v=>setIng({...ing,unitCost:+v})}/>
            <button onClick={addIng} style={{padding:'8px 12px',background:B,color:C,border:0,fontWeight:700,cursor:'pointer'}}>+</button>
          </div>
          <Tbl head={['INGREDIENT','QTY','UoM','UCOST','LINE']}>{sel.ingredients.map(i=><tr key={i.id} style={{borderBottom:`1px solid ${B}11`}}><td style={td}>{i.ingredient}</td><td style={td}>{i.qty}</td><td style={td}>{i.uom}</td><td style={td}>${i.unitCost}</td><td style={{...td,fontWeight:700,color:B}}>${(i.qty*i.unitCost).toFixed(2)}</td></tr>)}</Tbl>
          <div style={{marginTop:16,padding:10,background:C,borderLeft:`4px solid ${G}`,display:'flex',gap:8,alignItems:'center'}}>
            <span style={{color:B,fontWeight:600}}>Scale to:</span>
            <input type="number" value={target} onChange={e=>setTarget(+e.target.value)} style={{padding:6,border:`1px solid ${B}55`,width:100}}/>
            <span style={{color:B}}>{sel.baseUom}</span>
            <button onClick={scale} style={{marginLeft:8,padding:'6px 14px',background:G,color:B,border:0,fontWeight:700,cursor:'pointer'}}>SCALE</button>
            {scaled && <span style={{marginLeft:'auto',color:B}}>Factor: <b>{scaled.factor}×</b> · Total: <b>${scaled.totalCost}</b> · Per unit: <b>${scaled.costPerUnit}</b></span>}
          </div>
          {scaled && (
            <div style={{marginTop:8}}>
              <Tbl head={['INGREDIENT','SCALED QTY','UoM','LINE COST']}>{scaled.ingredients.map((s:any,i:number)=><tr key={i} style={{borderBottom:`1px solid ${B}11`}}><td style={td}>{s.ingredient}</td><td style={{...td,fontWeight:700,color:B}}>{s.qty}</td><td style={td}>{s.uom}</td><td style={td}>${s.lineCost.toFixed(2)}</td></tr>)}</Tbl>
            </div>
          )}
        </>)}
      </Panel>
    </div>
  </div>)
}
const td:React.CSSProperties={padding:6,fontSize:12}
const btnB:React.CSSProperties={padding:'6px 14px',background:G,color:B,border:0,fontWeight:700,cursor:'pointer',marginTop:6,marginBottom:8}
function Hdr({no,band,title,sub}:any){return <div style={{background:B,color:C,padding:'20px 32px',borderBottom:`4px solid ${G}`}}><div style={{fontSize:11,letterSpacing:2,opacity:.85}}>MODULE {no} · {band}</div><h1 style={{margin:'6px 0 0',fontSize:26,fontFamily:'Georgia,serif'}}>{title}</h1><div style={{fontSize:12,opacity:.8,marginTop:4}}>{sub}</div></div>}
function Panel({title,children}:any){return <div style={{background:'#fff',border:`1px solid ${B}33`}}><div style={{background:B,color:C,padding:'8px 12px',fontWeight:700,fontSize:12}}>{title}</div><div style={{padding:10}}>{children}</div></div>}
function Form({children}:any){return <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>{children}</div>}
function Inp({l,v,on,tp='text'}:{l:string;v:string;on:(v:string)=>void;tp?:string}){return <label><div style={{fontSize:10,color:B,fontWeight:600}}>{l}</div><input type={tp} value={v} onChange={e=>on(e.target.value)} style={{width:'100%',padding:6,border:`1px solid ${B}55`,fontSize:12}}/></label>}
function Tbl({head,children}:any){return <div style={{marginTop:8,maxHeight:380,overflowY:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr style={{background:B,color:C,position:'sticky',top:0}}>{head.map((h:string)=><th key={h} style={{padding:6,textAlign:'left',fontSize:11}}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div>}
