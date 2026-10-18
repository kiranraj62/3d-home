export async function captureView(): Promise<string> {
  const svg = document.querySelector('.plan svg');
  if (!svg) {
    const canvas = document.querySelector<HTMLCanvasElement>('.scene canvas');
    if (!canvas) throw new Error('The 3D view is still loading.');
    return canvas.toDataURL('image/png');
  }
  const copy = svg.cloneNode(true) as SVGElement;
  copy.setAttribute('xmlns','http://www.w3.org/2000/svg');
  copy.setAttribute('width','1200');copy.setAttribute('height','1300');
  copy.style.fontFamily='Arial, sans-serif';
  const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)],{type:'image/svg+xml;charset=utf-8'}));
  try {
    const image=new Image();
    await new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Plan image took too long to load. Please retry.')),8000);image.onload=()=>{clearTimeout(timer);resolve();};image.onerror=()=>{clearTimeout(timer);reject(new Error('Unable to export plan.'));};image.src=url;});
    const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1300;
    const ctx=canvas.getContext('2d')!;ctx.fillStyle='#edf2f0';ctx.fillRect(0,0,1200,1300);ctx.drawImage(image,0,0);
    return canvas.toDataURL('image/png');
  } finally { URL.revokeObjectURL(url); }
}

export function downloadImage(data:string,name:string) {
  const a=document.createElement('a');a.href=data;a.download=name;document.body.appendChild(a);a.click();a.remove();
}

export async function downloadPdf(data: string, title: string) {
  const image=new Image();
  await new Promise<void>((resolve,reject)=>{image.onload=()=>resolve();image.onerror=reject;image.src=data;});
  const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
  const context=canvas.getContext('2d')!;context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0);
  const binary=atob(canvas.toDataURL('image/jpeg',.94).split(',')[1]);
  const jpeg=Uint8Array.from(binary,c=>c.charCodeAt(0));
  const encoder=new TextEncoder();const chunks:Uint8Array[]=[];const offsets=[0];let size=0;
  const push=(value:string|Uint8Array)=>{const bytes=typeof value==='string'?encoder.encode(value):value;chunks.push(bytes);size+=bytes.length;};
  const object=(id:number,body:string)=>{offsets[id]=size;push(`${id} 0 obj\n${body}\nendobj\n`);};
  push('%PDF-1.4\n');
  object(1,'<< /Type /Catalog /Pages 2 0 R >>');
  object(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  object(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Image 4 0 R >> /Font << /F1 6 0 R >> >> /Contents 5 0 R >>');
  offsets[4]=size;push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);push(jpeg);push('\nendstream\nendobj\n');
  const scale=Math.min(523/image.width,640/image.height),w=image.width*scale,h=image.height*scale;
  const safeTitle=title.replace(/[^a-zA-Z0-9 .-]/g,'');
  const stream=`BT /F1 22 Tf 36 800 Td (Mangalam House) Tj /F1 11 Tf 0 -22 Td (${safeTitle} - V4.7) Tj ET\nq ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${((595-w)/2).toFixed(2)} ${(110+(640-h)/2).toFixed(2)} cm /Image Do Q\nBT /F1 9 Tf 36 65 Td (Concept proposal. Traditional lower roofs retained.) Tj 0 -15 Td (Modern upper frame, glass balcony and enclosed stair tower under one concrete roof.) Tj ET`;
  object(5,`<< /Length ${encoder.encode(stream).length} >>\nstream\n${stream}\nendstream`);
  object(6,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const start=size;push('xref\n0 7\n0000000000 65535 f \n');offsets.slice(1).forEach(n=>push(`${String(n).padStart(10,'0')} 00000 n \n`));push(`trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`);
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
  downloadImage(url,'mangalam-house-v3-review.pdf');return url;
}
