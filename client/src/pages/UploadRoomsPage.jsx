import UploadForm from "../components/UploadForm";
import { uploadRooms } from "../services/api";

function UploadRoomsPage() {

  const handleUpload = async (file) => {
    try {
      await uploadRooms(file);
      alert("Rooms file uploaded successfully");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div>
      <h2>Upload Rooms Excel</h2>
      <UploadForm onUpload={handleUpload} />
    </div>
  );
}

export default UploadRoomsPage;