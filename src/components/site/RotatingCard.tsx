import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cardDisplay } from '@/lib/card-display';

export function RotatingCard() {
  const host = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const [playing, setPlaying] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let cleanup = () => {};
    void import('three').then(THREE => {
      if (disposed) return;
      const css = getComputedStyle(element);
      const token = (name: string) => css.getPropertyValue(name).trim();
      const navy = token('--navy'), white = token('--navy-foreground'), red = token('--primary');
      const color = (value: string) => {
        const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (!ctx) return new THREE.Color();
        ctx.fillStyle = value; ctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        return new THREE.Color(`rgb(${r},${g},${b})`);
      };
      function texture(back: boolean) {
        const canvas = document.createElement('canvas'); canvas.width = 1080; canvas.height = 680;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Card drawing unavailable');
        ctx.fillStyle = navy; ctx.beginPath(); ctx.roundRect(0, 0, 1080, 680, 48); ctx.fill();
        ctx.fillStyle = red; ctx.fillRect(0, 540, 1080, 16);
        ctx.fillStyle = white; ctx.fillRect(0, 556, 1080, 8);
        ctx.font = 'bold 44px sans-serif'; ctx.fillText('VARENTA BANK', 64, 95);
        ctx.font = '20px sans-serif'; ctx.fillText('TRANSPARENT BY DESIGN', 66, 132);
        if (back) {
          ctx.fillStyle = token('--foreground'); ctx.fillRect(0, 178, 1080, 126);
          ctx.fillStyle = white; ctx.fillRect(64, 346, 730, 66);
          ctx.fillStyle = navy; ctx.font = '30px monospace'; ctx.fillText(cardDisplay.securityCode, 695, 390);
          ctx.fillStyle = white; ctx.font = '22px sans-serif'; ctx.fillText('VARENTA · DEBIT', 64, 490);
          ctx.font = '18px sans-serif'; ctx.fillText('This card remains the property of the issuer.', 64, 615);
        } else {
          ctx.fillStyle = white; ctx.beginPath(); ctx.roundRect(66, 215, 128, 98, 15); ctx.fill();
          ctx.strokeStyle = navy; ctx.lineWidth = 3;
          for (const x of [105, 150]) { ctx.beginPath(); ctx.moveTo(x,215); ctx.lineTo(x,313); ctx.stroke(); }
          ctx.beginPath(); ctx.moveTo(66,264); ctx.lineTo(194,264); ctx.stroke();
          ctx.strokeStyle = white; ctx.lineWidth = 5;
          for (const radius of [17, 30, 43]) { ctx.beginPath(); ctx.arc(224, 264, radius, -.75, .75); ctx.stroke(); }
          ctx.fillStyle = white; ctx.font = '36px monospace'; ctx.fillText(cardDisplay.number, 64, 398);
          ctx.font = '16px sans-serif'; ctx.fillText('CARDHOLDER',64,450); ctx.fillText('VALID THRU',690,450);
          ctx.font = '28px monospace'; ctx.fillText(cardDisplay.cardholder,64,494); ctx.fillText(cardDisplay.expiry,690,494);
          ctx.font = 'bold 25px sans-serif'; ctx.fillText('DEBIT',910,620);
        }
        const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace;
        return map;
      }
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      element.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, .1, 100); camera.position.z = 9;
      const group = new THREE.Group(); scene.add(group);
      const shape = new THREE.Shape(); const w=5.4,h=3.4,r=.24;
      shape.moveTo(-w/2+r,-h/2); shape.lineTo(w/2-r,-h/2); shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);
      shape.lineTo(w/2,h/2-r); shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2); shape.lineTo(-w/2+r,h/2);
      shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r); shape.lineTo(-w/2,-h/2+r); shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);
      const geometry = new THREE.ExtrudeGeometry(shape,{depth:.045,bevelEnabled:true,bevelSize:.015,bevelThickness:.01,bevelSegments:3,steps:1});
      const bodyMaterial = new THREE.MeshStandardMaterial({color:color(navy),metalness:.4,roughness:.4});
      group.add(new THREE.Mesh(geometry,bodyMaterial));
      const maps = [texture(false), texture(true)];
      const plane = new THREE.PlaneGeometry(w,h);
      const materials = maps.map(map => new THREE.MeshBasicMaterial({map,transparent:true}));
      const front = new THREE.Mesh(plane,materials[0]); front.position.z=.061; group.add(front);
      const back = new THREE.Mesh(plane,materials[1]); back.position.z=-.016; back.rotation.y=Math.PI; group.add(back);
      scene.add(new THREE.HemisphereLight(color(white),color(navy),3));
      const light=new THREE.DirectionalLight(color(white),4); light.position.set(3,4,6); scene.add(light);
      const resize = () => { const width=element.clientWidth,height=element.clientHeight; renderer.setSize(width,height); camera.aspect=width/height; camera.position.z=width<600?11:9; camera.updateProjectionMatrix(); };
      const observer=new ResizeObserver(resize); observer.observe(element); resize();
      const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
      let last=performance.now(); let angle=0;
      renderer.setAnimationLoop(time => { const delta=Math.min((time-last)/1000,.1); last=time; if(!paused.current&&!motion.matches) angle+=delta*Math.PI*2/cardDisplay.rotationSeconds; group.rotation.set(-.09,angle,-.035); element.dataset['rotation']=String(angle); renderer.render(scene,camera); });
      cleanup=()=>{observer.disconnect();renderer.setAnimationLoop(null);geometry.dispose();plane.dispose();bodyMaterial.dispose();materials.forEach(m=>m.dispose());maps.forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();};
    }).catch(()=>setFailed(true));
    return ()=>{disposed=true;cleanup();};
  }, []);
  return <section aria-label="VARENTA debit card display" className="relative bg-secondary">
    <div ref={host} role="img" aria-label="Rotating VARENTA BANK debit card, cardholder name and all card numbers masked" className="card-stage h-[320px] w-full md:h-[420px]" />
    {failed && <p className="absolute inset-0 flex items-center justify-center text-navy">VARENTA BANK · {cardDisplay.number}</p>}
    <Button variant="outline" size="icon" title={playing ? 'Pause rotation' : 'Resume rotation'} aria-label={playing ? 'Pause rotation' : 'Resume rotation'} className="absolute bottom-5 right-5" onClick={()=>{paused.current=!paused.current;setPlaying(!paused.current);}}>{playing ? <Pause className="size-4" /> : <Play className="size-4" />}</Button>
  </section>;
}
