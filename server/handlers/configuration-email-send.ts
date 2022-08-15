import fetch from "node-fetch";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { createResponse, isNotAllowedMethod } from "utils";

const HUBSPOT_FORMS_URL = process.env.HUBSPOT_FORMS_URL;
const HUBSPOT_FORM_PORTAL_ID = process.env.HUBSPOT_FORM_PORTAL_ID;
const HUBSPOT_FORM_GUID = process.env.HUBSPOT_FORM_GUID;

const formMap: {[key: string]: {[key: string]: number}} = {
  "save_my_design_language": {
      "fi": 1,
      "se": 2,
      "en": 3,
  },
  "save_my_design_product_category": {
      "wardrobe": 2,
      "sideboard": 3,
  },
  "save_my_design_model": {
      "ensiö": 1,
      "samsö": 2,
      "ingarö": 3,
  },
  "save_my_design_style": {
      "plain": 1,
      "spacer panel": 2,
      "spacer panels": 2,
      "frame": 3,
  },
  "save_my_design_width": {
      "100": 1,
      "120": 2,
      "150": 3,
      "160": 4,
      "200": 5,
      "250": 6,
      "260": 7,
      "300": 8,
      "60": 9,
      "80": 10,
  },
  "save_my_design_height": {
      "40": 1,
      "60": 2,
      "80": 3,
      "201": 4,
      "236": 5,
  },
  "save_my_design_all_colour": {
      "none": 0,
      "custom": 1,
      "natural white": 2,
      "blush rose": 3,
      "feather grey": 4,
      "linen brown": 5,
      "thermal grey": 6,
      "polar grey": 7,
      "water green": 8,
      "petrol blue": 9,
      "natural oak": 10,
      "white oak": 11,
      "smoke oak": 12,
      "natural walnut": 13,
      "midnight black": 14,
      "ivory beige": 15,
      "dusty rose": 16,
      "ash green": 17,
  },
  "save_my_design_door_colour": {
      "none": 0,
      "custom": 1,
      "natural white": 2,
      "blush rose": 3,
      "feather grey": 4,
      "linen brown": 5,
      "thermal grey": 6,
      "polar grey": 7,
      "water green": 8,
      "petrol blue": 9,
      "natural oak": 10,
      "white oak": 11,
      "smoke oak": 12,
      "natural walnut": 13,
      "midnight black": 14,
      "ivory beige": 15,
      "dusty rose": 16,
      "ash green": 17,
  },
  "save_my_design_side_panel_colour": {
      "none": 0,
      "custom": 1,
      "natural white": 2,
      "blush rose": 3,
      "feather grey": 4,
      "linen brown": 5,
      "thermal grey": 6,
      "polar grey": 7,
      "water green": 8,
      "petrol blue": 9,
      "natural oak": 10,
      "white oak": 11,
      "smoke oak": 12,
      "natural walnut": 13,
      "midnight black": 14,
      "ivory beige": 15,
      "dusty rose": 16,
      "ash green": 17,
  },
  "save_my_design_handle_model": {
      "none": 0,
      "no handles": 0,
      "push-open": 1,
      "parasol brass": 3,
      "parasol copper": 4,
      "parasol aluminium": 5,
      "parasol black aluminium": 6,
      "novel brass": 7,
      "novel copper": 8,
      "novel aluminium": 9,
      "novel black aluminium": 10,
      "bagel brass": 11,
      "bagel copper": 12,
      "bagel aluminium": 13,
      "bagel black aluminium": 14,
      "candy old rose": 15,
      "candy spotty white": 16,
      "candy granite black": 17,
      "novel mini brass": 18,
      "novel mini copper": 19,
      "novel mini aluminium": 20,
      "novel mini black aluminium": 21,
      "bagel mini brass": 22,
      "bagel mini copper": 23,
      "bagel mini aluminium": 24,
      "bagel mini black aluminium": 25,
  },
  "save_my_design_leg_model": {
      "none": 0,
      "no legs": 0,
      "wall mounted": 1,
      "stiletto low copper": 2,
      "stiletto low brass": 3,
      "stiletto low aluminium": 4,
      "stiletto low black aluminium": 5,
      "stiletto high copper": 6,
      "stiletto high brass": 7,
      "stiletto high aluminium": 8,
      "stiletto high black aluminium": 9,
      "crystal low copper": 10,
      "crystal low brass": 11,
      "crystal low aluminium": 12,
      "crystal low black aluminium": 13,
      "crystal high copper": 14,
      "crystal high brass": 15,
      "crystal high aluminium": 16,
      "crystal high black aluminium": 17,
      "candle low copper": 18,
      "candle low brass": 19,
      "candle low aluminium": 20,
      "candle low black aluminium": 21,
      "candle high copper": 22,
      "candle high brass": 23,
      "candle high aluminium": 24,
      "candle high black aluminium": 25,
  },
  "save_my_design_tabletop": {
      "none": 0,
      "no worktop": 0,
      "absolute black leather granite": 1,
      "beton ceramics": 2,
      "carrara marble": 3,
      "carrara quartz": 4,
      "coral clay quartz": 5,
      "super white quartz": 6,
  },
};

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  if (isNotAllowedMethod(event.httpMethod, ["POST"])) {
    return createResponse(405, { message: "Method not allowed" });
  }

  const hubspotFormUrl = `${HUBSPOT_FORMS_URL}submissions/v3/integration/submit/${HUBSPOT_FORM_PORTAL_ID}/${HUBSPOT_FORM_GUID}/`;

  const eventBody = JSON.parse(event.body.toLowerCase())
  console.log("Received form from Configurator: ", eventBody)

  const body = {
    fields: Object.keys(eventBody).map((key: string) => {
      if (formMap[key] !== undefined && eventBody[key] !== undefined && formMap[key][eventBody[key]] !== undefined) {
        return {
          name: key,
          value: formMap[key][eventBody[key]].toString().toLowerCase(),
        }
      } else if (key === 'firstname' || key === 'lastname') {
        return {
          name: key,
          value: eventBody[key].toString().charAt(0).toUpperCase() + eventBody[key].toString().slice(1),
        }
      } else {
        return {
          name: key,
          value: eventBody[key].toString().toLowerCase(),
        }
      }
    }),
  };

  console.log("Mapped hubspot form values form form: ", body)

  try {
    const response = await fetch(hubspotFormUrl, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      /* eslint-disable @typescript-eslint/camelcase */
      body: JSON.stringify(body),
    });
    const res = await response.json();
    console.log("Received the following response from Hubspot: ", res)

    return createResponse(200, { message: res.inlineMessage });
  } catch (e) {
    console.log("Following error when submitting the Hubspot form: ", e)
    return createResponse(500, { message: e.message });
  }
};
