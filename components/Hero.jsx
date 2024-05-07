import Image from 'next/image';

import { DisplayContextProvider } from 'components/context';
import { Demo, Logo } from 'components';

export const Hero = (props) => {
  const { children, hideMetrics, hideSheets } = props;

  return (
    <DisplayContextProvider>
      <HeroContent
        hideMetrics={hideMetrics}
        hideSheets={hideSheets}
        snippet={children}
      />
    </DisplayContextProvider>
  );
}

const HeroContent = (props) => {
  const { hideMetrics, hideSheets, snippet } = props;

  return (
    <div className='grid grid-rows lg:grid-cols-12 space-y-6'>
      <div className='lg:col-span-4 space-y-6 mr-6 mt-16'>
        <Intro />
        <div className='hidden lg:grid'>
          <Outro snippet={snippet} />
        </div>
      </div>
      <div className='lg:col-span-8'>
        <Demo
          hideMetrics={hideMetrics}
          hideSheets={hideSheets}
        />
      </div>
      <div className='grid lg:hidden'>
        <Outro
          snippet={snippet}
        />
      </div>
    </div>
  )
}

const Intro = () => {
  return (
    <div className=''>
      <Logo
        src='img/themes/pacifica/pacifica_main.png'
        width='420'
        height='100'
      />
        <h3 className='italic text-2xl font-semibold mb-9 mt-6 text-[#E14462]'>Helping Organizations find their Spirit.</h3>
        <div className='leading-loose space-y-6 mt-6'>
          <p>
          Welcome to Pacifica, where innovation meets human resources excellence. As a premier consulting firm,
          we specialize in revolutionizing HR practices through the seamless integration of data, analytics, and AI.
          Our mission is simple yet transformative: to empower organizations with actionable insights across key HR
          functions, including recruitment, payroll, retention, and DEI initiatives. With a keen focus on leveraging
          advanced technologies, we guide our clients towards informed decisions that enhance efficiency, productivity,
          and employee satisfaction. From unraveling recruitment challenges to optimizing payroll processes, Pacifica
          is your trusted partner in navigating the dynamic landscape of the modern workplace.
          </p>
          <Image
            src='img/themes/pacifica/pacifica_proserve.png'
            width='750'
            height='500'
            alt='stock pacifica photo'
          />
        </div>
    </div>
  )
}

const Outro = (props) => {
  const { snippet } = props;
  return (
    <div className='overflow-hidden'>
      <div className='leading-loose space-y-6 mt-6'>
        <p>
        With a focus on data, analytics, and AI, Pacifica stands out as a forward-thinking
        partner for businesses seeking to optimize their HR processes. By delving deep into the data
        landscape, Pacifica uncovers valuable insights that enable clients to enhance their recruitment
        strategies, streamline payroll operations, and boost employee retention rates. Through a combination
        of cutting-edge technology and expert human resources knowledge, Pacifica empowers organizations to
        navigate the complexities of the modern workplace with confidence and precision.
        </p>
        <Image
          src='img/themes/pacifica/pacifica_staffing.png'
          width='750'
          height='500'
          alt='stock pacifica photo'
        />
        <p>
        At Pacifica, we redefine the HR landscape through a blend of cutting-edge technology and expert
        human resources acumen. Our approach is rooted in precision and innovation, as we delve deep into
        data landscapes to uncover invaluable insights. With a commitment to excellence, we equip organizations
        with the tools and strategies needed to thrive in today's competitive business environment. Whether you're
        seeking to elevate recruitment strategies, streamline payroll operations, or enhance employee retention rates,
        Pacifica is here to guide you towards sustainable success. Join us on a journey of transformation, where
        data-driven methodologies pave the way for a future of unparalleled HR excellence.
        </p>
      </div>
    </div>
  )
}
