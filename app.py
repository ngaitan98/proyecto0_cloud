from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_restful import Api, Resource
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)
ma = Marshmallow(app)
api = Api(app)

CORS(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    surname = db.Column(db.String(255), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    registered_at = db.Column(db.DateTime, nullable=False)


class User_Schema(ma.Schema):
    class Meta:
        fields = ("id", "email", "name", "surname", "password", "registered_at")


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(255), nullable=False)
    location = db.Column(db.String(255), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    finish_date = db.Column(db.DateTime, nullable=False)
    virtual = db.Column(db.Boolean, nullable=False)
    address = db.Column(db.String(50), nullable=False)


class Event_Schema(ma.Schema):
    class Meta:
        fields = ("id", "user_id", "name", "category", "location",
                  "start_date", "finish_date", "virtual", "address")


user_schema = User_Schema()
users_schema = User_Schema(many=True)

event_schema = Event_Schema()
events_schema = Event_Schema(many=True)


class UserResource(Resource):
    def post(self):
        new_user = User(
            email=request.json['email'],
            password=request.json['password'],
            name=request.json['name'],
            surname=request.json['surname'],
            registered_at=datetime.now()
        )
        db.session.add(new_user)
        db.session.commit()
        print(new_user)
        return user_schema.dump(new_user)


class LoginResource(Resource):
    def post(self):
        user = User.query.filter_by(
            email=request.json['email'], password=request.json['password'])
        return users_schema.dump(user)

    def get(self):
        users = User.query.all()
        return users_schema.dump(users)


class EventsResource(Resource):
    def get(self, user_id):
        events = Event.query.filter_by(user_id=user_id)
        return events_schema.dump(events)

    def post(self, user_id):
        new_event = Event(
            user_id=user_id,
            name=request.json['name'],
            location=request.json['location'],
            start_date=datetime.strptime(request.json['start_date'],"%Y-%m-%dT%H:%M:%SZ"),
            finish_date=datetime.strptime(request.json['finish_date'], "%Y-%m-%dT%H:%M:%SZ"),
            virtual=request.json['virtual'],
            address=request.json['address'],
            category=request.json['category']
        )
        db.session.add(new_event)
        db.session.commit()
        return event_schema.dump(new_event)

class EventResource(Resource):
    def get(self, user_id, event_id):
        event = Event.query.filter_by(user_id=user_id, id=event_id).first()
        return event_schema.dump(event)

    def delete(self, user_id, event_id):
        event = Event.query.filter_by(user_id=user_id, id=event_id).first()
        db.session.delete(event)
        db.session.commit()
        return '', 204
    def put(self, user_id, event_id):
        event = Event.query.filter_by(user_id=user_id, id=event_id).first()
        if 'name' in request.json:
            event.name = request.json['name']
        if 'location' in request.json:
            event.location = request.json['location']
        if 'virtual' in request.json:
            event.virtual = request.json['virtual']
        if 'address' in request.json:
            event.address = request.json['address']
        if 'category' in request.json:
            event.category = request.json['category']
        if 'start_date' in request.json:
            event.star_date = datetime.strptime(request.json['start_date'],"%Y-%m-%dT%H:%M:%SZ")
        if 'finish_date' in request.json:
            event.finish_date = datetime.strptime(request.json['finish_date'],"%Y-%m-%dT%H:%M:%SZ")
        db.session.commit()
        return event_schema.dump(event)
    

api.add_resource(UserResource, '/register')
api.add_resource(LoginResource, '/login')
api.add_resource(EventsResource,'/users/<int:user_id>/events')
api.add_resource(EventResource,'/users/<int:user_id>/events/<int:event_id>')

if __name__ == '__main__':
    app.run(debug=True)
