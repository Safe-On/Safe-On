import pandas as pd
from pyproj import Transformer

# CSV 읽기
df = pd.read_csv("C:/Users/chloe/safe-on-project/data/shelters_climate.csv")

# 변환기 설정
transformer = Transformer.from_crs("EPSG:5186", "EPSG:4326", always_xy=True)

# 위도, 경도 열 추가
df[['longitude', 'latitude']] = df.apply(
    lambda row: pd.Series(transformer.transform(row['x_coord'], row['y_coord'])),
    axis=1
)

# 저장
df.to_csv("shelters_climate_with_latlon.csv", index=False)
