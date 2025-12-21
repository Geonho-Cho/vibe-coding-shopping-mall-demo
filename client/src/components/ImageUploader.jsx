import { useEffect, useRef } from 'react';

// Cloudinary 설정 (환경변수에서 로드)
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// 환경변수 설정 여부 확인
const isCloudinaryConfigured = CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET;

function ImageUploader({ imageUrl, onImageChange }) {
  const widgetRef = useRef(null);

  useEffect(() => {
    // 환경변수가 설정되지 않았으면 위젯 초기화 스킵
    if (!isCloudinaryConfigured) return;

    // Cloudinary 위젯 초기화
    if (window.cloudinary && !widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUDINARY_CLOUD_NAME,
          uploadPreset: CLOUDINARY_UPLOAD_PRESET,
          sources: ['local', 'url', 'camera'],
          multiple: false,
          maxFiles: 1,
          maxFileSize: 10000000, // 10MB
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          cropping: true,
          croppingAspectRatio: 1,
          showSkipCropButton: true,
          styles: {
            palette: {
              window: '#FFFFFF',
              windowBorder: '#90A0B3',
              tabIcon: '#0078FF',
              menuIcons: '#5A616A',
              textDark: '#000000',
              textLight: '#FFFFFF',
              link: '#0078FF',
              action: '#FF620C',
              inactiveTabIcon: '#0E2F5A',
              error: '#F44235',
              inProgress: '#0078FF',
              complete: '#20B832',
              sourceBg: '#E4EBF1'
            }
          },
          text: {
            ko: {
              or: '또는',
              back: '뒤로',
              advanced: '고급',
              close: '닫기',
              no_results: '결과 없음',
              search_placeholder: '검색...',
              about_uw: '업로드 위젯 정보',
              local: {
                browse: '파일 선택',
                dd_title_single: '여기에 파일을 끌어다 놓으세요',
                drop_title_single: '파일을 놓아 업로드하세요'
              },
              url: {
                inner_title: 'URL로 업로드:',
                input_placeholder: '파일 URL을 입력하세요'
              },
              camera: {
                capture: '촬영',
                cancel: '취소',
                take_pic: '사진 촬영',
                explanation: '카메라가 화면에 표시됩니다. 사진을 찍으려면 촬영 버튼을 누르세요.'
              },
              crop: {
                title: '이미지 자르기',
                crop_btn: '자르기',
                skip_btn: '건너뛰기',
                reset_btn: '초기화'
              },
              queue: {
                title: '업로드 대기열',
                done: '완료',
                statuses: {
                  uploading: '업로드 중...',
                  error: '오류',
                  uploaded: '완료',
                  aborted: '취소됨'
                }
              }
            }
          },
          language: 'ko'
        },
        (error, result) => {
          if (!error && result && result.event === 'success') {
            onImageChange(result.info.secure_url);
          }
        }
      );
    }

    return () => {
      if (widgetRef.current) {
        widgetRef.current.destroy();
        widgetRef.current = null;
      }
    };
  }, [onImageChange]);

  const handleOpenWidget = () => {
    if (!isCloudinaryConfigured) {
      alert('Cloudinary 환경변수가 설정되지 않았습니다.\n.env 파일에 VITE_CLOUDINARY_CLOUD_NAME과 VITE_CLOUDINARY_UPLOAD_PRESET을 설정해주세요.');
      return;
    }
    if (widgetRef.current) {
      widgetRef.current.open();
    }
  };

  const handleRemoveImage = () => {
    onImageChange('');
  };

  const handleUrlChange = (e) => {
    onImageChange(e.target.value);
  };

  return (
    <div className="form-group">
      <label>상품 이미지 *</label>
      <div className="image-upload-area">
        {imageUrl ? (
          <div className="image-preview">
            <img src={imageUrl} alt="미리보기" />
            <button
              type="button"
              className="btn-remove-image"
              onClick={handleRemoveImage}
            >
              ×
            </button>
          </div>
        ) : (
          <div
            className="image-upload-placeholder"
            onClick={handleOpenWidget}
          >
            <span className="upload-icon">📷</span>
            <span>클릭하여 이미지 업로드</span>
            <span className="upload-hint">
              {isCloudinaryConfigured
                ? '최대 10MB, JPG/PNG/GIF/WebP'
                : '⚠️ Cloudinary 환경변수 설정 필요'}
            </span>
          </div>
        )}
      </div>
      {/* URL 직접 입력 옵션 */}
      <input
        type="text"
        value={imageUrl}
        onChange={handleUrlChange}
        placeholder="또는 이미지 URL을 직접 입력"
        className="image-url-input"
      />
      {/* 이미지가 있을 때 다시 업로드 버튼 */}
      {imageUrl && (
        <button
          type="button"
          className="btn-reupload"
          onClick={handleOpenWidget}
        >
          다른 이미지 업로드
        </button>
      )}
    </div>
  );
}

export default ImageUploader;
