from django.contrib.auth.models import User
from .models import Ticket
class Functions():
    #Receives a Dictionary with User-Ids and returns an Array with User-Ids
    def getUserObjectsAsArray(request):
        extracted_user_ids = request.data.get('ticket_to_user')
        if (extracted_user_ids != '' and extracted_user_ids != None):
         extracted_user_ids =  extracted_user_ids.split(',')
         extracted_user_ids = [int(x) for x in extracted_user_ids]
         related_user_models = User.objects.filter(id__in=extracted_user_ids)
         return related_user_models
        else:
         return []
    #Prints out the required Fields of the Ticket-model
    def test_get_required_fields(self):
       required_fields = []
       for field in Ticket._meta.fields:
            if not field.blank:
                required_fields.append(field.name)
       return print(required_fields) 