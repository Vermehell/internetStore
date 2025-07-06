from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from backend.database import Base, engine
from backend.routers import users, products, categories, cart, admin, orders

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(users.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(cart.router)
app.include_router(admin.router)
app.include_router(orders.router)

@app.get("/")
def read_root():
    return {"message": "Computer Store API"}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)