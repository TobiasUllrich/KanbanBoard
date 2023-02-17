from django.contrib.auth.models import User
from .models import Ticket
class Functions():

    def getUserObjectsAsArray(request):
        extracted_user_ids = request.data.get('ticket_to_user')
        if (extracted_user_ids != ''):
         print('ERSTENS ',extracted_user_ids)
         extracted_user_ids =  extracted_user_ids.split(',')
         print('ERSTENS ',extracted_user_ids)
         extracted_user_ids = [int(x) for x in extracted_user_ids]
         print('ERSTENS ',extracted_user_ids)
         print('USER-IDs AS ARRAY ',extracted_user_ids)
         related_user_models = User.objects.filter(id__in=extracted_user_ids)
         print('USER-INSTANCES AS ARRAY  ',related_user_models)
         return related_user_models
        else:
         return []

    def test_get_required_fields(self):
       required_fields = []
       for field in Ticket._meta.fields:
            if not field.blank:
                required_fields.append(field.name)
       return print(required_fields) 