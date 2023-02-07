from rest_framework import serializers #Um den Serializer des REST-Frameworks benutzen zu können
from django.contrib.auth.models import User #Model User wird importiert
from .models import Board, Ticket #Models Board & Tickets werden importiert

#User-Serializer (defines the API)
class UserSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = User
        fields = ['id','username','first_name','last_name','email','password']


#Board-Serializer (defines the API)
class BoardSerializer(serializers.HyperlinkedModelSerializer):
    board_to_user = UserSerializer(many=True) #ManyToMany-Field which contains an Array of Users
    board_user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all()) #ForeignKey-Field which contains a single User

    class Meta:
        model = Board
        fields = ['id','board_name','board_user','board_created_at','board_to_user']


#Ticket-Serializer (defines the API)
class TicketSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Ticket
        fields = ['id','ticket_description','ticket_title','ticket_duedate','ticket_prio','ticket_category','ticket_created_at','ticket_to_user','ticket_board']