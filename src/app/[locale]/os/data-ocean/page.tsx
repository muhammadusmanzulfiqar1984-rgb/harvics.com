'use client'
/** #55 Data Ocean */
import { useEffect, useState } from 'react'
import { Hdr, Panel, Page, Grid, Sel, Tbl, btnB, td, getJson, postJson, B } from '@/components/os/w5ui'
export default function P(){
  const [snaps,setSnaps]=useState<any[]>([]);const [tables,setTables]=useState<string[]>([]);const [stats,setStats]=useState<any>(null)
  const [pick,setPick]=useState('Customer')
  const load=async()=>{const a=await getJson('/api/wave7/snapshots');setSnaps(a.data||[]);setTables(a.snapshottableTables||[]);setStats((await getJson('/api/wave7/lake-stats')).data||{})}
  useEffect(()=>{void load()},[])
  const snap=async()=>{try{await postJson('/api/wave7/snapshots',{tableName:pick,capturedBy:'demo-user'});await load()}catch(e:any){alert(e.message)}}
  return <Page><Hdr no="#55" band="DATA & AI" title="Data Ocean" sub="Table snapshots · warehouse view · lake size telemetry"/>
  <Grid cols={3}>
    <Panel title="CAPTURE SNAPSHOT">
      <Sel l="Source table" v={pick} on={setPick} opts={tables}/>
      <button onClick={snap} style={btnB}>📸 SNAPSHOT NOW</button>
      <div style={{marginTop:10,padding:8,background:'#F5F1E8',borderLeft:`4px solid ${B}`,fontSize:11,color:B}}>Each snapshot counts records, estimates size, and registers it as an immutable lake artefact.</div>
    </Panel>
    <Panel title="LAKE STATS">
      {!stats?'Loading...':<>
        <div style={{padding:8,background:'#F5F1E8',marginBottom:8}}>
          <div style={{fontSize:10,color:B,fontWeight:600}}>TOTAL SNAPSHOTS</div>
          <div style={{fontSize:28,fontWeight:700,color:B}}>{stats.totalSnapshots||0}</div>
          <div style={{fontSize:11,color:'#666'}}>Storage: <b>{stats.totalMB||0} MB</b></div>
        </div>
        <Tbl head={['TABLE','SNAPS','RECORDS','BYTES']}>{(stats.byTable||[]).map((t:any)=><tr key={t.table}>
          <td style={td}><b>{t.table}</b></td><td style={td}>{t.snapshots}</td><td style={td}>{t.totalRecords.toLocaleString()}</td><td style={{...td,fontSize:11}}>{t.totalBytes.toLocaleString()}</td>
        </tr>)}</Tbl>
      </>}
    </Panel>
    <Panel title={`SNAPSHOTS (${snaps.length})`} full>
      <Tbl head={['WHEN','TABLE','RECORDS','SIZE','FORMAT','STORAGE REF']}>
        {snaps.map(s=><tr key={s.id} style={{borderBottom:'1px solid #6B1F2B11'}}>
          <td style={{...td,fontSize:11}}>{new Date(s.capturedAt).toLocaleString()}</td>
          <td style={td}><b>{s.tableName}</b></td>
          <td style={{...td,fontWeight:700,color:B}}>{s.recordCount.toLocaleString()}</td>
          <td style={td}>{(s.sizeBytes/1024).toFixed(1)} KB</td>
          <td style={td}>{s.format}</td>
          <td style={{...td,fontSize:10,fontFamily:'monospace'}}>{s.storageRef}</td>
        </tr>)}
      </Tbl>
    </Panel>
  </Grid></Page>
}
