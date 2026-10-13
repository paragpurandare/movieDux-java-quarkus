// import { Button, Empty, List, Typography } from 'antd';
// import { DeleteOutlined } from '@ant-design/icons';

// const { Text } = Typography;

// export default function Watchlist({
//   movies = [],
//   onRemove,
//   loading = false,
// }) {
//   if (loading && movies.length === 0) {
//     return <Text>Loading watchlist...</Text>;
//   }

//   if (movies.length === 0) {
//     return (
//       <Empty
//         description="Your watchlist is empty."
//       />
//     );
//   }

//   return (
//     <List
//       dataSource={movies}
//       rowKey={(movie) =>
//         String(movie.id ?? movie.movieId)
//       }
//       renderItem={(movie) => (
//         <List.Item
//           actions={
//             onRemove
//               ? [
//                   <Button
//                     key="remove"
//                     danger
//                     type="text"
//                     icon={<DeleteOutlined />}
//                     onClick={() => onRemove(movie)}
//                   >
//                     Remove
//                   </Button>,
//                 ]
//               : []
//           }
//         >
//           <List.Item.Meta
//             title={movie.title || 'Untitled movie'}
//             description={movie.actors || ''}
//           />
//         </List.Item>
//       )}
//     />
//   );
// }


//Ant Design v1

import { Row, Col, Empty, Typography, Spin } from 'antd';
import MovieCard from './MovieCard';

const { Title } = Typography;

const Watchlist = ({ movies = [], watchlist = [], toggleWatchlist, loading = false }) => {
  const watchlistedMovies = movies.filter((movie) =>
    watchlist.some((id) => String(id) === String(movie.id))
  );

  return (
    <div className="watchlist-container">
      <Title level={2} className="section-title">
        Your Watchlist
      </Title>

      {loading && movies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : watchlistedMovies.length === 0 ? (
        <Empty description="Your watchlist is empty" />
      ) : (
        <Row gutter={[24, 24]} className="watchlist">
          {watchlistedMovies.map((movie) => (
            <Col
              key={movie.id}
              xs={24}
              sm={12}
              md={8}
              lg={6}
              xl={6}
            >
              <MovieCard
                movie={movie}
                isWatchlisted={true}
                toggleWatchlist={toggleWatchlist}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Watchlist;


//Without Ant Design
// import React from "react";
// import "../styles.css";
// import MovieCard from "./MovieCard";

// const Watchlist = ({ movies, watchlist, toggleWatchlist }) => {
//   return (
//     <div>
//       <h1 className="title">Your Watchlist</h1>
//       <div className="watchlist">
//         {watchlist.map((id) => {
//           const movie = movies.find((movie) => movie.id === id);
//           return (
//             <MovieCard
//               key={id}
//               movie={movie}
//               toggleWatchlist={toggleWatchlist}
//               isWatchlisted={true}
//             ></MovieCard>
//           );
//         })}
//       </div>
//     </div>
//   );
// }


// export default Watchlist;