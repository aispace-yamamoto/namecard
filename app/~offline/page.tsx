export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6 text-center">
      <p className="text-4xl mb-4">📡</p>
      <h1 className="text-xl font-bold mb-2">オフラインです</h1>
      <p className="text-gray-500">
        インターネットに接続できません。
        <br />
        接続が回復したら再度お試しください。
      </p>
    </div>
  );
}
