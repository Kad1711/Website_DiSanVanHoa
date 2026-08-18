import { Link } from 'react-router-dom';
import { ArrowRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PlayIcon, MapIcon, SparklesIcon } from '@heroicons/react/24/solid';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[600px] sm:min-h-[700px] flex items-center justify-center bg-gray-900 overflow-hidden">
        {/* Background Image & Overlay */}
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1596700684711-53e34b1767de?q=80&w=2000&auto=format&fit=crop')] 
                     bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay"
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900/90"></div>

        <div className="container-lg relative z-10 pt-20 pb-16 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <SparklesIcon className="w-4 h-4 text-secondary-300" />
              <span className="text-sm font-medium text-white tracking-wide uppercase">Không Gian Văn Học Số</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold font-serif text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
              Hồn Cốt <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-300 to-secondary-500">
                Đại Ngàn
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              Khám phá và lưu giữ kho tàng văn học phong phú của các dân tộc thiểu số Việt Nam qua lăng kính công nghệ số.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-500">
              <Link 
                to="/map" 
                className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base rounded-full shadow-lg shadow-primary/30"
              >
                <MapIcon className="w-5 h-5" /> Khám phá bản đồ
              </Link>
              <Link 
                to="/works" 
                className="w-full sm:w-auto px-8 py-3.5 text-base font-medium text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full transition-all flex items-center justify-center gap-2"
              >
                Đọc tác phẩm <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-cream to-transparent z-10"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-cream relative z-20">
        <div className="container-lg">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Trải Nghiệm Đa Chiều</h2>
            <p className="text-gray-600">Chúng tôi ứng dụng công nghệ để làm sống lại các tác phẩm văn học dân gian, đưa bạn vào một không gian trải nghiệm hoàn toàn mới.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Bản đồ tương tác',
                desc: 'Khám phá sự phân bố không gian và nguồn gốc địa lý của từng tác phẩm, từng dân tộc qua bản đồ 3D sống động.',
                icon: MapIcon,
                color: 'text-primary',
                bg: 'bg-primary-50',
              },
              {
                title: 'Tác phẩm đa phương tiện',
                desc: 'Đọc văn bản, nghe Audio, và xem video AI tái hiện lại các câu chuyện cổ tích, truyền thuyết một cách chân thực.',
                icon: PlayIcon,
                color: 'text-secondary-600',
                bg: 'bg-secondary-50',
              },
              {
                title: 'Nghiên cứu văn hóa',
                desc: 'Hệ thống tra cứu chuyên sâu giúp người đọc dễ dàng tìm hiểu về phong tục, tập quán và con người của 54 dân tộc anh em.',
                icon: MagnifyingGlassIcon,
                color: 'text-earth',
                bg: 'bg-orange-50',
              }
            ].map((feature, i) => (
              <div key={i} className="card-hover p-8 text-center group cursor-pointer border-none bg-white/60 backdrop-blur-sm">
                <div className={`w-16 h-16 mx-auto rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-900"></div>
        <div className="absolute inset-0 bg-[url('/src/assets/hero-pattern.svg')] opacity-10"></div>
        
        <div className="container-lg relative z-10 flex flex-col items-center text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-white mb-6">Bạn đã sẵn sàng bước vào?</h2>
          <p className="text-primary-100 mb-10 max-w-xl text-lg">
            Đăng ký tài khoản ngay hôm nay để lưu lại những tác phẩm yêu thích và tham gia đóng góp cho cộng đồng.
          </p>
          <Link to="/register" className="px-8 py-4 bg-secondary text-white font-medium text-lg rounded-full hover:bg-secondary-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            Tạo tài khoản miễn phí
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
