import { useRef, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import Header from '../components/Header';
import { getProductById } from '../constants/products';
import useCustomStore from '../store/useCustomStore';
import './CustomizePage.css';

/* ═══════════════════════════════════════════════════════════
   3D JACKET MODEL — Detailed geometry matching real jacket
═══════════════════════════════════════════════════════════ */
function JacketModel({ selections }) {
  const bodyRef      = useRef();
  const leftSleeveRef  = useRef();
  const rightSleeveRef = useRef();
  const collarRef    = useRef();
  const zipperRef    = useRef();

  useEffect(() => {
    if (bodyRef.current)      bodyRef.current.color.set(selections.body.color);
    if (leftSleeveRef.current)  leftSleeveRef.current.color.set(selections.sleeveLeft.color);
    if (rightSleeveRef.current) rightSleeveRef.current.color.set(selections.sleeveRight.color);
  }, [selections]);

  const bodyRoughness = selections.body.material?.includes('leather') ? 0.35 : 0.72;
  const bodyMetalness = selections.body.material?.includes('leather') ? 0.05 : 0.0;
  const sleeveRoughness = selections.sleeveLeft.material?.includes('leather') ? 0.35 : 0.72;

  return (
    <group position={[0, -0.2, 0]}>
      {/* ── FRONT BODY PANEL ── */}
      <mesh castShadow>
        <boxGeometry args={[1.65, 2.1, 0.48]} />
        <meshStandardMaterial ref={bodyRef} color={selections.body.color} roughness={bodyRoughness} metalness={bodyMetalness} />
      </mesh>

      {/* ── BACK BODY PANEL (slightly deeper) ── */}
      <mesh position={[0, 0.05, -0.02]} castShadow>
        <boxGeometry args={[1.65, 2.2, 0.44]} />
        <meshStandardMaterial color={selections.body.color} roughness={bodyRoughness} metalness={bodyMetalness} />
      </mesh>

      {/* ── SHOULDER PANEL ── */}
      <mesh position={[0, 1.12, 0]} castShadow>
        <boxGeometry args={[1.75, 0.18, 0.52]} />
        <meshStandardMaterial color={selections.body.color} roughness={bodyRoughness + 0.05} metalness={bodyMetalness} />
      </mesh>

      {/* ── LEFT SLEEVE (upper arm) ── */}
      <mesh position={[-1.22, 0.3, 0]} rotation={[0, 0, 0.12]} castShadow>
        <cylinderGeometry args={[0.305, 0.275, 1.4, 20]} />
        <meshStandardMaterial ref={leftSleeveRef} color={selections.sleeveLeft.color} roughness={sleeveRoughness} metalness={0.05} />
      </mesh>
      {/* LEFT SLEEVE (forearm, slightly angled down) */}
      <mesh position={[-1.36, -0.67, 0.02]} rotation={[0.08, 0, 0.18]} castShadow>
        <cylinderGeometry args={[0.275, 0.25, 1.0, 20]} />
        <meshStandardMaterial color={selections.sleeveLeft.color} roughness={sleeveRoughness} metalness={0.05} />
      </mesh>
      {/* LEFT CUFF RIBBING */}
      <mesh position={[-1.44, -1.18, 0.03]} rotation={[0.08, 0, 0.2]}>
        <cylinderGeometry args={[0.26, 0.26, 0.22, 20]} />
        <meshStandardMaterial color={selections.body.color} roughness={0.9} />
      </mesh>

      {/* ── RIGHT SLEEVE ── */}
      <mesh position={[1.22, 0.3, 0]} rotation={[0, 0, -0.12]} castShadow>
        <cylinderGeometry args={[0.305, 0.275, 1.4, 20]} />
        <meshStandardMaterial ref={rightSleeveRef} color={selections.sleeveRight.color} roughness={sleeveRoughness} metalness={0.05} />
      </mesh>
      <mesh position={[1.36, -0.67, 0.02]} rotation={[0.08, 0, -0.18]} castShadow>
        <cylinderGeometry args={[0.275, 0.25, 1.0, 20]} />
        <meshStandardMaterial color={selections.sleeveRight.color} roughness={sleeveRoughness} metalness={0.05} />
      </mesh>
      {/* RIGHT CUFF RIBBING */}
      <mesh position={[1.44, -1.18, 0.03]} rotation={[0.08, 0, -0.2]}>
        <cylinderGeometry args={[0.26, 0.26, 0.22, 20]} />
        <meshStandardMaterial color={selections.body.color} roughness={0.9} />
      </mesh>

      {/* ── COLLAR ── */}
      <mesh position={[0, 1.18, 0.06]}>
        <torusGeometry args={[0.38, 0.1, 14, 48, Math.PI * 1.35]} />
        <meshStandardMaterial color={selections.collar?.color || selections.body.color} roughness={0.85} />
      </mesh>

      {/* ── HEM / WAISTBAND ── */}
      <mesh position={[0, -1.15, 0]}>
        <boxGeometry args={[1.7, 0.22, 0.52]} />
        <meshStandardMaterial color={selections.body.color} roughness={0.92} />
      </mesh>

      {/* ── ZIPPER / FRONT CLOSURE ── */}
      <mesh ref={zipperRef} position={[0, 0.02, 0.252]}>
        <boxGeometry args={[0.04, 1.85, 0.01]} />
        <meshStandardMaterial
          color={selections.closure?.zipperColor || '#888888'}
          metalness={0.9} roughness={0.2}
        />
      </mesh>
      {/* Zipper pull */}
      <mesh position={[0, 0.55, 0.26]}>
        <boxGeometry args={[0.06, 0.12, 0.02]} />
        <meshStandardMaterial color={selections.hardware?.buttonMaterial === 'brass' ? '#b8860b' : '#888888'} metalness={0.95} roughness={0.1} />
      </mesh>

      {/* ── CHEST POCKETS ── */}
      <mesh position={[-0.52, 0.38, 0.252]}>
        <boxGeometry args={[0.38, 0.24, 0.012]} />
        <meshStandardMaterial color={selections.body.color} roughness={bodyRoughness + 0.1} />
      </mesh>
      <mesh position={[-0.52, 0.26, 0.256]}>
        <boxGeometry args={[0.38, 0.02, 0.01]} />
        <meshStandardMaterial color={selections.closure?.zipperColor || '#888888'} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* ── LOWER POCKETS ── */}
      <mesh position={[-0.6, -0.5, 0.252]}>
        <boxGeometry args={[0.5, 0.32, 0.012]} />
        <meshStandardMaterial color={selections.body.color} roughness={bodyRoughness + 0.1} />
      </mesh>
      <mesh position={[0.6, -0.5, 0.252]}>
        <boxGeometry args={[0.5, 0.32, 0.012]} />
        <meshStandardMaterial color={selections.body.color} roughness={bodyRoughness + 0.1} />
      </mesh>

      {/* ── BUTTONS ── */}
      {[-0.5, -0.1, 0.3, 0.7].map((y, i) => (
        <mesh key={i} position={[0.04, y, 0.254]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshStandardMaterial
            color={selections.hardware?.buttonMaterial === 'brass' ? '#b8860b' : selections.hardware?.buttonMaterial === 'silver' ? '#c0c0c0' : '#2a2a2a'}
            metalness={0.9} roughness={0.15}
          />
        </mesh>
      ))}

      {/* ── CHEST STRIPE (varsity style accent) ── */}
      {selections.body.material === 'wool-melton' && (
        <mesh position={[0, 0.48, 0.252]}>
          <boxGeometry args={[1.62, 0.055, 0.01]} />
          <meshStandardMaterial color="#FF4D00" roughness={0.7} />
        </mesh>
      )}
    </group>
  );
}

function HoodieModel({ selections }) {
  const bodyRef = useRef();
  const leftRef = useRef();
  const rightRef = useRef();

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.color.set(selections.body.color);
    if (leftRef.current)  leftRef.current.color.set(selections.sleeveLeft.color);
    if (rightRef.current) rightRef.current.color.set(selections.sleeveRight.color);
  }, [selections]);

  return (
    <group position={[0, -0.25, 0]}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[1.7, 2.2, 0.52]} />
        <meshStandardMaterial ref={bodyRef} color={selections.body.color} roughness={0.85} metalness={0.0} />
      </mesh>
      {/* Hood */}
      <mesh position={[0, 1.35, -0.12]}>
        <sphereGeometry args={[0.62, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={selections.hood?.liningColor || selections.body.color} roughness={0.88} />
      </mesh>
      {/* Left Sleeve */}
      <mesh position={[-1.2, 0.3, 0]} rotation={[0,0,0.1]} castShadow>
        <cylinderGeometry args={[0.31, 0.27, 1.5, 20]} />
        <meshStandardMaterial ref={leftRef} color={selections.sleeveLeft.color} roughness={0.85} />
      </mesh>
      <mesh position={[-1.34, -0.7, 0]} rotation={[0,0,0.15]} castShadow>
        <cylinderGeometry args={[0.27, 0.24, 1.0, 20]} />
        <meshStandardMaterial color={selections.sleeveLeft.color} roughness={0.85} />
      </mesh>
      {/* Right Sleeve */}
      <mesh position={[1.2, 0.3, 0]} rotation={[0,0,-0.1]} castShadow>
        <cylinderGeometry args={[0.31, 0.27, 1.5, 20]} />
        <meshStandardMaterial ref={rightRef} color={selections.sleeveRight.color} roughness={0.85} />
      </mesh>
      <mesh position={[1.34, -0.7, 0]} rotation={[0,0,-0.15]} castShadow>
        <cylinderGeometry args={[0.27, 0.24, 1.0, 20]} />
        <meshStandardMaterial color={selections.sleeveRight.color} roughness={0.85} />
      </mesh>
      {/* Kangaroo Pocket */}
      <mesh position={[0, -0.55, 0.268]}>
        <boxGeometry args={[0.85, 0.45, 0.015]} />
        <meshStandardMaterial color={selections.body.color} roughness={0.9} />
      </mesh>
      {/* Hem ribbing */}
      <mesh position={[0, -1.2, 0]}>
        <boxGeometry args={[1.72, 0.2, 0.54]} />
        <meshStandardMaterial color={selections.body.color} roughness={0.92} />
      </mesh>
    </group>
  );
}

/* ═══════════════════════════════════════════════════════════
   VIEWER COMPONENT
═══════════════════════════════════════════════════════════ */
function Viewer3D({ product, selections }) {
  const [controlling, setControlling] = useState(false);

  return (
    <div
      className={`viewer-wrapper ${controlling ? 'controlling' : ''}`}
      onPointerDown={() => setControlling(true)}
      onPointerUp={() => setControlling(false)}
    >
      <Canvas camera={{ position: [0, 0.5, 5], fov: 38 }} shadows>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={2.0} castShadow />
        <directionalLight position={[-4, 2, -3]} intensity={0.5} color="#6688ff" />
        <pointLight position={[0, -2, 3]} intensity={0.3} color="#ff8844" />
        <Environment preset="city" />

        {product?.category === 'hoodie'
          ? <HoodieModel selections={selections} />
          : <JacketModel selections={selections} />
        }

        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={2.5}
          maxDistance={8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI * 0.75}
        />
      </Canvas>
      <div className="viewer-hint">Drag to rotate · Scroll to zoom</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CUSTOMIZATION PANEL
═══════════════════════════════════════════════════════════ */
function CollapsibleSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="cust-section">
      <button className="section-header" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        {title}
        <span className="section-chevron">{open ? '−' : '+'}</span>
      </button>
      <div className={`section-body ${open ? 'open' : ''}`}>
        <div className="section-body-inner">{children}</div>
      </div>
    </div>
  );
}

const COLORS_PALETTE = [
  '#111111','#FFFFFF','#1a2744','#8b1a1a','#2d4a2d','#c8a05a',
  '#6b1a2a','#f5e6d3','#4a4a2a','#2a4a7a','#808080','#5a1a1a',
  '#b8860b','#1a4a8a','#6b4e37','#f0ede8','#9a9a9a','#333333',
];

const JACKET_MATERIALS = [
  { id:'wool-melton',        label:'Wool Melton' },
  { id:'genuine-leather',   label:'Genuine Leather' },
  { id:'full-grain-leather',label:'Full-Grain Leather', extra:'+$40' },
  { id:'suede',             label:'Suede', extra:'+$25' },
  { id:'denim',             label:'Denim' },
  { id:'nylon',             label:'Nylon' },
  { id:'cotton-canvas',     label:'Cotton Canvas' },
  { id:'softshell',         label:'Softshell', extra:'+$15' },
];

const HOODIE_MATERIALS = [
  { id:'french-terry',  label:'French Terry' },
  { id:'fleece',        label:'Fleece' },
  { id:'sherpa',        label:'Sherpa', extra:'+$10' },
  { id:'merino-wool',   label:'Merino Wool', extra:'+$20' },
];

function SwatchPicker({ current, onChange, label }) {
  return (
    <div className="swatch-picker">
      {label && <span className="pdp-label" style={{marginBottom:8,display:'block'}}>{label}</span>}
      <div className="swatch-row">
        {COLORS_PALETTE.map(hex => (
          <button
            key={hex}
            className={`swatch ${current === hex ? 'selected' : ''}`}
            style={{ background: hex, border: hex === '#FFFFFF' || hex === '#f5e6d3' || hex === '#f0ede8' ? '1px solid #444' : undefined }}
            onClick={() => onChange(hex)}
            aria-label={hex}
          />
        ))}
      </div>
    </div>
  );
}

function MaterialPicker({ current, onChange, materials }) {
  return (
    <div className="material-picker">
      {materials.map(m => (
        <button
          key={m.id}
          className={`material-chip ${current === m.id ? 'active' : ''}`}
          onClick={() => onChange(m.id)}
        >
          {m.label}
          {m.extra && <span className="material-price">{m.extra}</span>}
        </button>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PRICE BREAKDOWN
═══════════════════════════════════════════════════════════ */
function PriceBreakdown({ product }) {
  const [addOns, totalPrice] = useCustomStore(s => {
    const basePrice = s.currentProduct?.basePrice || 0;
    const { CONTRAST_SLEEVE_PRICE: CSP, HARDWARE_PRICES: HP, ZIPPER_PRICES: ZP, TEXT_PRICES: TP, CUSTOM_LINING_PRICE: CLP, EPAULET_PRICE: EP } = require('../constants/pricing');
    const sel = s.selections;
    const items = [];
    if (sel.sleeveLeft.color !== sel.body.color || sel.sleeveRight.color !== sel.body.color) {
      items.push({ label:'Sleeve contrast', price: CSP });
    }
    if (sel.text.value) items.push({ label:'Custom text', price: TP.placement });
    if (sel.straps.epaulets) items.push({ label:'Epaulets', price: EP });
    if (sel.hood.detachable) items.push({ label:'Detachable hood', price: 20 });
    const zipExtra = ZP[sel.closure.type] || 0;
    if (zipExtra > 0) items.push({ label:`${sel.closure.type} zipper`, price: zipExtra });
    const total = basePrice + items.reduce((s,i) => s + i.price, 0);
    return [items, total];
  });

  const setRunwayOpen = useCustomStore(s => s.setRunwayOpen);
  const addToCartFn   = useCustomStore(s => s.addToCart);
  const navigate      = useNavigate();

  return (
    <div className="price-breakdown card">
      <div className="price-breakdown-header">
        <span>PRICE BREAKDOWN</span>
        <span className="price-flash">${totalPrice}</span>
      </div>
      <div className="price-line-items">
        <div className="price-line">
          <span>Base</span>
          <span>${product?.basePrice || 0}</span>
        </div>
        {addOns.map((a, i) => (
          <div key={i} className="price-line addon">
            <span>{a.label}</span>
            <span className="text-accent">+${a.price}</span>
          </div>
        ))}
        <div className="divider" style={{margin:'8px 0'}} />
        <div className="price-line total">
          <span>TOTAL</span>
          <span className="text-accent">${totalPrice}</span>
        </div>
      </div>
      <button className="btn btn-ghost runway-btn animate-pulse"
        onClick={() => { setRunwayOpen(true); navigate('/runway'); }}
      >
        ▶ RUNWAY PREVIEW
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN CUSTOMIZE PAGE
═══════════════════════════════════════════════════════════ */
export default function CustomizePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const product = getProductById(id);
  const { selections, initProduct, setColor, setMaterial, setSelection, linkSleeves, setLinkSleeves, addToCart } = useCustomStore();
  const currentProduct = useCustomStore(s => s.currentProduct);

  useEffect(() => {
    if (product && (!currentProduct || currentProduct.id !== product.id)) {
      initProduct(product);
    }
  }, [id, product]);

  if (!product) return <div style={{padding:'200px',textAlign:'center'}}><h2>Product not found</h2></div>;

  const materials = product.category === 'hoodie' ? HOODIE_MATERIALS : JACKET_MATERIALS;

  const handleAddToCart = () => {
    addToCart();
    navigate('/cart');
  };

  return (
    <div className="customize-page">
      <Header />

      {/* Page Header */}
      <div className="customize-topbar">
        <button className="btn-text" onClick={() => navigate(-1)} style={{display:'flex',alignItems:'center',gap:6}}>
          ← Back
        </button>
        <div>
          <span className="customize-prod-name">{product.shortName}</span>
          <span className="customize-prod-start"> · Starting at ${product.basePrice}</span>
        </div>
      </div>

      <div className="customize-layout">
        {/* ── LEFT: 3D VIEWER + PRICE ── */}
        <div className="customize-left">
          <Viewer3D product={currentProduct || product} selections={selections} />
          <PriceBreakdown product={currentProduct || product} />
        </div>

        {/* ── RIGHT: CUSTOMIZATION PANEL ── */}
        <div className="customize-panel">
          <h2 className="panel-title">CUSTOMIZE</h2>
          <div className="panel-scroll">

            {/* BODY */}
            <CollapsibleSection title="BODY" defaultOpen={true}>
              <SwatchPicker
                label="Color"
                current={selections.body.color}
                onChange={hex => setColor('body', hex)}
              />
              <div style={{marginTop:14}}>
                <span className="pdp-label" style={{display:'block',marginBottom:8}}>Material</span>
                <MaterialPicker
                  current={selections.body.material}
                  onChange={mat => setMaterial('body', mat)}
                  materials={materials}
                />
              </div>
            </CollapsibleSection>

            {/* SLEEVES */}
            <CollapsibleSection title="SLEEVES" defaultOpen={true}>
              <label className="link-toggle">
                <input type="checkbox" checked={linkSleeves} onChange={e => setLinkSleeves(e.target.checked)} />
                <span>Link Left &amp; Right</span>
              </label>
              <div className="sleeve-row">
                <div className="sleeve-col">
                  <SwatchPicker
                    label={linkSleeves ? 'Both Sleeves' : 'Left Sleeve'}
                    current={selections.sleeveLeft.color}
                    onChange={hex => setColor('sleeveLeft', hex)}
                  />
                </div>
                {!linkSleeves && (
                  <div className="sleeve-col">
                    <SwatchPicker
                      label="Right Sleeve"
                      current={selections.sleeveRight.color}
                      onChange={hex => setColor('sleeveRight', hex)}
                    />
                  </div>
                )}
              </div>
              <div style={{marginTop:12}}>
                <MaterialPicker
                  current={selections.sleeveLeft.material}
                  onChange={mat => setMaterial('sleeveLeft', mat)}
                  materials={materials}
                />
              </div>
            </CollapsibleSection>

            {/* COLLAR */}
            <CollapsibleSection title="COLLAR">
              <div style={{marginBottom:12}}>
                <span className="pdp-label" style={{display:'block',marginBottom:8}}>Style</span>
                <MaterialPicker
                  current={selections.collar?.style || 'ribbed'}
                  onChange={v => setSelection('collar','style',v)}
                  materials={[
                    {id:'ribbed',label:'Ribbed'},
                    {id:'stand',label:'Stand Collar'},
                    {id:'mandarin',label:'Mandarin'},
                    {id:'shawl',label:'Shawl'},
                  ]}
                />
              </div>
              <SwatchPicker
                label="Color"
                current={selections.collar?.color || selections.body.color}
                onChange={hex => setSelection('collar','color',hex)}
              />
            </CollapsibleSection>

            {/* CLOSURE */}
            <CollapsibleSection title="CLOSURE">
              <div style={{marginBottom:12}}>
                <span className="pdp-label" style={{display:'block',marginBottom:8}}>Type</span>
                <MaterialPicker
                  current={selections.closure.type}
                  onChange={v => setSelection('closure','type',v)}
                  materials={[
                    {id:'snap',label:'Snap Button'},
                    {id:'exposed',label:'Exposed YKK'},
                    {id:'hidden',label:'Hidden Zip',extra:'+$5'},
                    {id:'two-way',label:'Two-Way',extra:'+$8'},
                    {id:'waterproof',label:'Waterproof',extra:'+$10'},
                  ]}
                />
              </div>
              <SwatchPicker
                label="Zipper Color"
                current={selections.closure.zipperColor}
                onChange={hex => setSelection('closure','zipperColor',hex)}
              />
            </CollapsibleSection>

            {/* POCKETS */}
            <CollapsibleSection title="POCKETS">
              <MaterialPicker
                current={selections.pockets.style}
                onChange={v => setSelection('pockets','style',v)}
                materials={[
                  {id:'standard',label:'Side Pockets'},
                  {id:'cargo',label:'Cargo',extra:'+$8'},
                  {id:'zippered',label:'Zippered',extra:'+$6'},
                  {id:'hidden',label:'Hidden',extra:'+$5'},
                ]}
              />
            </CollapsibleSection>

            {/* HARDWARE */}
            <CollapsibleSection title="HARDWARE">
              <div style={{marginBottom:12}}>
                <span className="pdp-label" style={{display:'block',marginBottom:8}}>Button Metal</span>
                <MaterialPicker
                  current={selections.hardware.buttonMaterial}
                  onChange={v => setSelection('hardware','buttonMaterial',v)}
                  materials={[
                    {id:'plastic',label:'Plastic'},
                    {id:'brass',label:'Brass',extra:'+$6'},
                    {id:'silver',label:'Silver',extra:'+$6'},
                    {id:'antique',label:'Antique',extra:'+$8'},
                  ]}
                />
              </div>
              <div>
                <span className="pdp-label" style={{display:'block',marginBottom:8}}>Zipper Pull</span>
                <MaterialPicker
                  current={selections.hardware.zipperPull}
                  onChange={v => setSelection('hardware','zipperPull',v)}
                  materials={[
                    {id:'standard',label:'Standard'},
                    {id:'leather',label:'Leather Tab'},
                    {id:'paracord',label:'Paracord'},
                  ]}
                />
              </div>
            </CollapsibleSection>

            {/* TEXT */}
            <CollapsibleSection title="TEXT & EMBROIDERY">
              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <div>
                  <span className="pdp-label" style={{display:'block',marginBottom:6}}>Your Text</span>
                  <input
                    type="text"
                    value={selections.text.value}
                    onChange={e => setSelection('text','value',e.target.value)}
                    placeholder="e.g. CHAMPION 23"
                    maxLength={20}
                  />
                </div>
                <div>
                  <span className="pdp-label" style={{display:'block',marginBottom:6}}>Font</span>
                  <MaterialPicker
                    current={selections.text.font}
                    onChange={v => setSelection('text','font',v)}
                    materials={[
                      {id:'Oswald',label:'Block'},
                      {id:'Georgia',label:'Serif'},
                      {id:'Impact',label:'Impact'},
                      {id:'Courier New',label:'Mono'},
                    ]}
                  />
                </div>
                <div>
                  <span className="pdp-label" style={{display:'block',marginBottom:6}}>Placement</span>
                  <MaterialPicker
                    current={selections.text.placement}
                    onChange={v => setSelection('text','placement',v)}
                    materials={[
                      {id:'chest',label:'Chest'},
                      {id:'back',label:'Back'},
                      {id:'sleeve',label:'Sleeve'},
                      {id:'hood',label:'Hood'},
                    ]}
                  />
                </div>
                <div>
                  <span className="pdp-label" style={{display:'block',marginBottom:6}}>Effect</span>
                  <MaterialPicker
                    current={selections.text.effect}
                    onChange={v => setSelection('text','effect',v)}
                    materials={[
                      {id:'none',label:'Standard'},
                      {id:'puff',label:'3D Puff',extra:'+$10'},
                      {id:'reflective',label:'Reflective',extra:'+$12'},
                      {id:'metallic',label:'Metallic',extra:'+$8'},
                      {id:'glitter',label:'Glitter',extra:'+$10'},
                    ]}
                  />
                </div>
                <SwatchPicker label="Text Color" current={selections.text.color} onChange={hex => setSelection('text','color',hex)} />
              </div>
            </CollapsibleSection>

            {/* STRAPS & SHOULDERS */}
            <CollapsibleSection title="STRAPS & SHOULDERS">
              <div className="toggle-row">
                <label className="link-toggle">
                  <input type="checkbox"
                    checked={selections.straps.epaulets}
                    onChange={e => setSelection('straps','epaulets',e.target.checked)}
                  />
                  <span>Epaulets (+$8)</span>
                </label>
                <label className="link-toggle">
                  <input type="checkbox"
                    checked={selections.straps.waistBelt}
                    onChange={e => setSelection('straps','waistBelt',e.target.checked)}
                  />
                  <span>Waist Belt</span>
                </label>
              </div>
            </CollapsibleSection>

            {/* HOOD (jacket with hood / hoodie) */}
            {(product.category === 'hoodie' || selections.hood.enabled) && (
              <CollapsibleSection title="HOOD">
                <div className="toggle-row">
                  <label className="link-toggle">
                    <input type="checkbox"
                      checked={selections.hood.detachable}
                      onChange={e => setSelection('hood','detachable',e.target.checked)}
                    />
                    <span>Detachable (+$20)</span>
                  </label>
                </div>
                <SwatchPicker
                  label="Lining Color"
                  current={selections.hood.liningColor}
                  onChange={hex => setSelection('hood','liningColor',hex)}
                />
              </CollapsibleSection>
            )}
          </div>

          {/* ADD TO CART CTA */}
          <div className="panel-cta">
            <button className="btn btn-primary panel-add-btn" onClick={handleAddToCart}>
              ADD TO CART · <TotalDisplay />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TotalDisplay() {
  const total = useCustomStore(s => {
    if (!s.currentProduct) return 0;
    const base = s.currentProduct.basePrice;
    // simple sum
    let extra = 0;
    const sel = s.selections;
    if (sel.sleeveLeft.color !== sel.body.color) extra += 12;
    if (sel.text.value) extra += 15;
    if (sel.straps.epaulets) extra += 8;
    if (sel.hood.detachable) extra += 20;
    const zipMap = {snap:0,exposed:0,hidden:5,'two-way':8,waterproof:10};
    extra += zipMap[sel.closure.type] || 0;
    return base + extra;
  });
  return <>${total}</>;
}
