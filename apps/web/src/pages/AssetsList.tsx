import { useQuery } from '@tanstack/react-query'

export default function AssetsList() {
  const { data, isLoading } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const res = await fetch(import.meta.env.VITE_API_URL + '/assets')
      return res.json()
    }
  })

  if (isLoading) return <div>Cargando...</div>
  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Activos</h1>
      <ul className="space-y-2">
        {(data?.items ?? []).map((a: any) => (
          <li key={a.id} className="border rounded p-2">
            <div className="font-medium">{a.code} — {a.name}</div>
            <div className="text-sm opacity-70">{a.categoryName}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}