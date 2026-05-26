'use client'
/** #19 Bill of Materials — header + components + explode */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Form, Inp, Tbl } from '../controlling/page'
const B='#6B1F2B'; const G='#C3A35E'; const C='#F5F1E8'
interface Comp{id:string;componentSku:string;componentName:string|null;qtyPer:number;uom:string;scrapPercent:number;unitCost:number}
interface BOM{id:string;productSku:string;productName:string;version:string;uom:string;active:boolean;components:Comp[]}
export default function BOMPage(){
  const [boms,setBoms]=useState<BOM[]>([])
  const [sel,setSel]=useState<BOM|null>(null)
  const [form,setForm]=useState({productSku:'',productName:'',version:'v1',uom:'EA'})
  const [comp,setComp]=useState({componentSku:'',componentName:'',qtyPer:1,uom:'EA',scrapPercent:0,unitCost:0})
  const [qty,setQty]=useState(1)
  const [tree,setTree]=useState<any>(null);const [sum,setSum]=useState<any>(null)
  const load=async()=>{setBoms((await(await fetch('/api/wave4/boms',{cache:'no-store'})).json()).data||[])}
  useEffect(()=>{void load()},[])
  const create=async()=>{if(!form.productSku||!form.productName)return alert('SKU+name required');const r=await(await fetch('/api/wave4/boms',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})).json();if(!r.success)return alert(JSON.stringify(r.issues||r.error));setForm({...form,productSku:'',productName:''});await load()}
  const addComp=async()=>{if(!sel)return;if(!comp.componentSku||comp.qtyPer<=0)return alert('Comp SKU+qty required');const r=await(await fetch(`/api/wave4/boms/${sel.id}/components`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(comp)})).json();if(!r.success)return alert(JSON.stringify(r.issues||r.error));setComp({componentSku:'',componentName:'',qtyPer:1,uom:'EA',scrapPercent:0,unitCost:0});await load();const fresh=(await(await fetch('/api/wave4/boms',{cache:'no-store'})).json()).data;setSel(fresh.find((x:BOM)=>x.id===sel.id)||null)}
  const explode=async()=>{if(!sel)return;const r=await(await fetch(`/api/wave4/boms/explode/${encodeURIComponent(sel.productSku)}?qty=${qty}`)).json();if(!r.success)return alert(r.error);setTree(r.data);setSum(r.summary)}
  const Node=({n,d}:{n:any;d:number})=>(<div><div style={{padding:`3px 8px 3px ${12+d*16}px`,borderBottom:`1px solid ${B}11`,fontSize:12,display:'flex',gap:6}}>
    <span style={{fontFamily:'monospace',fontWeight:700,color:B,minWidth:90}}>{n.sku}</span>
    <span style={{flex:1}}>{n.name||(n.leaf?'(raw)':'')}</span>
    <span style={{minWidth:80,textAlign:'right',fontFamily:'monospace'}}>{n.qty||1} {n.uom||''}</span>
    {n.lineCost!==undefined && <span style={{minWidth:80,textAlign:'right',color:B,fontWeight:600,fontFamily:'monospace'}}>${n.lineCost.toLocaleString()}</span>}
  </div>{n.children?.map((c:any,i:number)=><Node key={i} n={c} d={d+1}/>)}</div>)
  return(<div style={{fontFamily:'system-ui',minHeight:'100vh',background:C}}>
    <Hdr no="#19" band="MANUFACTURING & OPERATIONS" title="Bill of Materials" sub="Multi-level BOM with scrap-aware explode and cost rollup"/>
    <div style={{padding:'12px 24px 24px',display:'grid',gridTemplateColumns:'1fr 2fr',gap:16}}>
      <Panel title="BOMS">
        <Form><Inp l="Product SKU *" v={form.productSku} on={v=>setForm({...form,productSku:v})}/><Inp l="Product name *" v={form.productName} on={v=>setForm({...form,productName:v})}/><Inp l="Version" v={form.version} on={v=>setForm({...form,version:v})}/><Inp l="UoM" v={form.uom} on={v=>setForm({...form,uom:v})}/></Form>
        <button onClick={create} style={btnB}>+ NEW BOM</button>
        <Tbl head={['SKU','NAME','V','#COMP']}>{boms.map(b=><tr key={b.id} onClick={()=>{setSel(b);setTree(null);setSum(null)}} style={{borderBottom:`1px solid ${B}11`,cursor:'pointer',background:sel?.id===b.id?C:'#fff'}}><td style={td}>{b.productSku}</td><td style={td}>{b.productName}</td><td style={td}>{b.version}</td><td style={td}>{b.components.length}</td></tr>)}</Tbl>
      </Panel>
      <Panel title={sel?`${sel.productSku} — ${sel.productName}`:'Select a BOM'}>
        {!sel?<div style={{padding:24,color:'#888',textAlign:'center'}}>Pick a BOM to add components and explode</div>:(<>
          <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr) auto',gap:6,alignItems:'end'}}>
            <Inp l="Comp SKU *" v={comp.componentSku} on={v=>setComp({...comp,componentSku:v})}/>
            <Inp l="Comp name" v={comp.componentName} on={v=>setComp({...comp,componentName:v})}/>
            <Inp l="Qty per *" tp="number" v={String(comp.qtyPer)} on={v=>setComp({...comp,qtyPer:+v})}/>
            <Inp l="UoM" v={comp.uom} on={v=>setComp({...comp,uom:v})}/>
            <Inp l="Scrap %" tp="number" v={String(comp.scrapPercent)} on={v=>setComp({...comp,scrapPercent:+v})}/>
            <Inp l="Unit cost" tp="number" v={String(comp.unitCost)} on={v=>setComp({...comp,unitCost:+v})}/>
            <button onClick={addComp} style={{padding:'8px 12px',background:B,color:C,border:0,fontWeight:700,cursor:'pointer'}}>+</button>
          </div>
          <Tbl head={['SKU','NAME','QTY','UoM','SCRAP%','UCOST']}>{sel.components.map(c=><tr key={c.id} style={{borderBottom:`1px solid ${B}11`}}><td style={td}>{c.componentSku}</td><td style={td}>{c.componentName||'—'}</td><td style={td}>{c.qtyPer}</td><td style={td}>{c.uom}</td><td style={td}>{c.scrapPercent}%</td><td style={td}>${c.unitCost}</td></tr>)}</Tbl>
          <div style={{marginTop:16,padding:10,background:C,borderLeft:`4px solid ${G}`}}>
            <span style={{color:B,fontWeight:600}}>Explode for qty:</span>
            <input type="number" value={qty} onChange={e=>setQty(+e.target.value)} style={{padding:6,marginLeft:8,border:`1px solid ${B}55`,width:80}}/>
            <button onClick={explode} style={{marginLeft:8,padding:'6px 14px',background:G,color:B,border:0,fontWeight:700,cursor:'pointer'}}>EXPLODE</button>
            {sum && <span style={{marginLeft:16,color:B}}>Cost: <b>${sum.totalCost.toLocaleString()}</b> · {sum.uniqueComponents} unique parts</span>}
          </div>
          {tree && <div style={{marginTop:8,background:'#fff',border:`1px solid ${B}33`}}><Node n={tree} d={0}/></div>}
        </>)}
      </Panel>
    </div>
  </div>)
}
const td:React.CSSProperties={padding:6,fontSize:12}
const btnB:React.CSSProperties={padding:'6px 14px',background:G,color:B,border:0,fontWeight:700,cursor:'pointer',marginTop:6,marginBottom:8}
