import { useCallback, useState, useEffect } from 'react'
import ReactFlow, { Background, Controls, MiniMap, applyEdgeChanges, applyNodeChanges } from 'reactflow'
import 'reactflow/dist/style.css'
import { Info } from 'lucide-react'

// Basic layout of fundamental rights mapping to institutions
function RightsMap({ isSwahili }) {
  const getInitialNodes = (sw) => [
    { id: '1', position: { x: 250, y: 50 }, data: { label: sw ? 'Katiba (Sheria Kuu)' : 'The Constitution (Supreme Law)' }, type: 'input', style: { background: '#000000', color: '#fff', border: '2px solid #D4A017' } },
    { id: '2', position: { x: 100, y: 200 }, data: { label: sw ? 'Muswada wa Haki' : 'Bill of Rights' }, style: { background: '#111111', color: '#3ecfa0', border: '1px solid #006A4E' } },
    { id: '3', position: { x: 400, y: 200 }, data: { label: sw ? 'Vyombo vya Dola na Utawala' : 'State Organs & Governance' }, style: { background: '#111111', color: '#f47285', border: '1px solid #C8102E' } },
    { id: '4', position: { x: -50, y: 350 }, data: { label: sw ? 'Ibara ya 43: Afya, Maji, Nyumba' : 'Article 43: Health, Water, Housing' }, style: { background: '#1a1a1a', color: '#fff', border: '1px solid #333' } },
    { id: '5', position: { x: 150, y: 350 }, data: { label: sw ? 'Ibara ya 49: Haki za Kukamatwa' : 'Article 49: Arrest Rights' }, style: { background: '#1a1a1a', color: '#fff', border: '1px solid #333' } },
    { id: '6', position: { x: 350, y: 350 }, data: { label: sw ? 'Idara ya Mahakama (Mahakama)' : 'The Judiciary (Courts)' }, style: { background: '#1a1a1a', color: '#fff', border: '1px solid #333' } },
    { id: '7', position: { x: 550, y: 350 }, data: { label: sw ? 'Tume Huru (mfano IPOA, EACC)' : 'Independent Commissions (e.g. IPOA, EACC)' }, style: { background: '#1a1a1a', color: '#fff', border: '1px solid #333' } },
    { id: '8', position: { x: 50, y: 550 }, data: { label: sw ? 'Utekelezaji wa Kisheria' : 'Judicial Enforcement (Public Interest Cases)' }, style: { background: '#0a0a0a', color: '#7db8ff', border: '1px solid #3b82f6' } },
  ]

  const getInitialEdges = (sw) => [
    { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#006A4E' } },
    { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#C8102E' } },
    { id: 'e2-4', source: '2', target: '4', style: { stroke: '#555' } },
    { id: 'e2-5', source: '2', target: '5', style: { stroke: '#555' } },
    { id: 'e3-6', source: '3', target: '6', style: { stroke: '#555' } },
    { id: 'e3-7', source: '3', target: '7', style: { stroke: '#555' } },
    { id: 'e4-8', source: '4', target: '8', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e5-8', source: '5', target: '8', animated: true, style: { stroke: '#3b82f6' } },
    { id: 'e6-8', source: '6', target: '8', animated: true, style: { stroke: '#3b82f6' }, label: sw ? 'Husikiliza mambo' : 'Hears matters' },
    { id: 'e7-5', source: '7', target: '5', animated: true, style: { stroke: '#D4A017' }, label: sw ? 'Usimamizi' : 'Oversight' },
  ]

  const [nodes, setNodes] = useState(getInitialNodes(isSwahili))
  const [edges, setEdges] = useState(getInitialEdges(isSwahili))

  // Update labels when language changes without resetting position
  useEffect(() => {
    const translationMap = getInitialNodes(isSwahili).reduce((acc, node) => {
      acc[node.id] = node.data.label
      return acc
    }, {})

    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, label: translationMap[node.id] || node.data.label },
      }))
    )

    const edgeMap = getInitialEdges(isSwahili).reduce((acc, edge) => {
      acc[edge.id] = edge.label
      return acc
    }, {})

    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        label: edgeMap[edge.id] || edge.label,
      }))
    )
  }, [isSwahili])

  const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [])
  const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [])

  return (
    <section className="animate-fade-up">
      <div className="mb-6">
        <span className="label text-ink-4 block mb-2">{isSwahili ? 'Unganisha Sheria kwa Macho' : 'Visually Connect the Law'}</span>
        <h2 className="headline text-fluid-2xl text-ink-1 font-semibold mb-2 flex items-center gap-3">
          {isSwahili ? 'Ramani ya Mtiririko Inayoingiliana' : 'Interactive Flow Map'}
        </h2>
        <p className="text-ink-3 max-w-xl text-sm leading-relaxed">
          {isSwahili 
            ? 'Vuta vizuizi ili uelewe jinsi haki zako za kimsingi zinavyounganishwa na taasisi za serikali zilizopewa jukumu la kuzilinda.' 
            : 'Drag the blocks around to understand how your fundamental rights are connected to the state institutions tasked with protecting them.'}
        </p>
      </div>

      <div className="glass-card w-full h-[600px] overflow-hidden relative">
        <div className="absolute top-4 left-4 z-10 bg-surface-3 bg-opacity-80 backdrop-blur text-xs px-3 py-1.5 rounded-full border border-subtle flex items-center gap-2 text-ink-2">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          {isSwahili ? 'Ubao Unaoingiliana: Buruta ili kusogeza' : 'Interactive Canvas: Drag to move'}
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
          attributionPosition="bottom-right"
        >
          <Background color="#333" gap={16} />
          <MiniMap style={{ background: '#111', border: '1px solid #333' }} nodeColor="#555" maskColor="rgba(0,0,0,0.6)" />
          <Controls className="bg-surface-3 !border-subtle fill-white [&>button]:!border-subtle hover:[&>button]:bg-surface-4" />
        </ReactFlow>
      </div>
    </section>
  )
}

export default RightsMap
