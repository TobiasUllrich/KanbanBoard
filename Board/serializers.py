from rest_framework import serializers #Um den Serializer des REST-Frameworks benutzen zu können
from django.contrib.auth.models import User #Model User wird importiert
from .models import List, Ticket #Models List & Ticket werden importiert

#Users-Serializer (defines the API)
class UsersSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = User
        fields = ['id','username']

#Lists-Serializer (defines the API)
class ListsSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = List
        fields = ['id','list_name']


#Tickets-Serializer (defines the API)
class TicketsSerializer(serializers.HyperlinkedModelSerializer):
    ticket_list = serializers.PrimaryKeyRelatedField(queryset=List.objects.all()) #ForeignKey-Field which contains a single List
    ticket_to_user = UsersSerializer(many=True) #ManyToMany-Field which contains an Array of User

    class Meta:
        model = Ticket
        fields = ['id','ticket_description','ticket_title','ticket_duedate','ticket_prio','ticket_created_at','ticket_list','ticket_to_user']
                                                                                                                       