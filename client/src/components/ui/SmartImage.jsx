import React, { useState } from 'react';

/**
 * SmartImage
 * Tự động phát hiện tỉ lệ ảnh thực tế (natural aspect ratio) khi tải:
 * - Ảnh dọc / chân dung / tranh nhân vật (naturalHeight > naturalWidth): tự động căn đỉnh 'center top'
 *   giúp gương mặt, mũ áo truyền thống và đầu nhân vật không bao giờ bị cắt mất.
 * - Ảnh ngang / toàn cảnh phong cảnh (naturalWidth >= naturalHeight): tự động căn giữa 'center center'
 *   giúp giữ trọn bố cục không gian, không bị mất tiền cảnh phía dưới.
 */
const SmartImage = ({ src, alt, className = '', style = {}, ...props }) => {
  const [position, setPosition] = useState('center top');

  const handleLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalHeight > naturalWidth) {
      setPosition('center top');
    } else {
      setPosition('center center');
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{ ...style, objectPosition: position }}
      onLoad={handleLoad}
      {...props}
    />
  );
};

export default SmartImage;
