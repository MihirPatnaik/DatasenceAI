//src/smartsocial/components/PostButton.tsx


export default function PostButton({
  imageUrl,
  caption,
  onBack
}: {
  imageUrl: string;
  caption: string;
  onBack: () => void;
}) {
  return (
    <div className="space-y-4">
      {imageUrl && <img src={imageUrl} alt="Post Preview" className="rounded-lg" />}
      <p>{caption}</p>
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
        >
          Back
        </button>
        <button
          onClick={() => alert("Post sent! (Logic TBD)")}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Post Now
        </button>
      </div>
    </div>
  );
}
