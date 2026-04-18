import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout';
import StudentLayout from '../../components/StudentLayout';
import './QRCodePage.css';

export default function QRCodePage() {
  const { user } = useAuth();

  const isStudent = user?.roleId === 1;
  const Wrapper = isStudent ? StudentLayout : Layout;

  return (
    <Wrapper>
      <div className="qr-page">
        <div className="qr-page-header">
          <h1 className="qr-page-title">QR Code</h1>
          <p className="qr-page-subtitle">Scan to access the VR Nationalian app</p>
        </div>

        <div className="qr-card">
          <div className="qr-image-wrapper">
            <img src="/qr-code.jpeg" alt="QR Code" />
          </div>
          <span className="qr-label">VR Nationalian</span>
          <p className="qr-description">
            Scan this QR code with your mobile device to download and access the VR Nationalian experience.
          </p>
        </div>
      </div>
    </Wrapper>
  );
}
